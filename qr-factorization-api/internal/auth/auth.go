package auth

import (
  "crypto/hmac"
  "crypto/sha256"
  "encoding/base64"
  "encoding/json"
  "fmt"
  "net/http"
  "os"
  "strings"
  "time"

  "qr-factorization-api/internal/response"
)

type LoginRequest struct {
  Email    string `json:"email"`
  Password string `json:"password"`
}

type tokenPayload struct {
  Sub string `json:"sub"`
  Exp int64  `json:"exp"`
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
  var req LoginRequest
  if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
    response.Error(w, http.StatusBadRequest, "INVALID_REQUEST_BODY")
    return
  }

  if req.Email != os.Getenv("API_EMAIL") || req.Password != os.Getenv("API_PASSWORD") {
    response.Error(w, http.StatusUnauthorized, "INVALID_CREDENTIALS")
    return
  }

  token, _ := generateJwt(req.Email)
  response.Success(w, http.StatusOK, map[string]string{"token": token})
}

func ValidateHandler(w http.ResponseWriter, r *http.Request) {
  response.Success(w, http.StatusOK)
}

func generateJwt(email string) (string, error) {
  header := base64.RawURLEncoding.EncodeToString([]byte(`{"alg":"HS256","typ":"JWT"}`))
  expiration := time.Now().Add(time.Minute * 5).Unix()
  payload := base64.RawURLEncoding.EncodeToString([]byte(fmt.Sprintf(`{"sub":"%s","exp":%d}`, email, expiration)))

  message := header + "." + payload
  h := hmac.New(sha256.New, []byte(os.Getenv("JWT_SECRET")))
  h.Write([]byte(message))
  jwt := base64.RawURLEncoding.EncodeToString(h.Sum(nil))

  return message + "." + jwt, nil
}

func Middleware(next http.HandlerFunc) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    authHeader := r.Header.Get("Authorization")
    if !strings.HasPrefix(authHeader, "Bearer ") {
      response.Error(w, http.StatusUnauthorized, "MISSING_OR_INVALID_TOKEN")
      return
    }

    tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

    parts := strings.Split(tokenStr, ".")
    if len(parts) != 3 {
      response.Error(w, http.StatusUnauthorized, "INVALID_TOKEN_FORMAT")
      return
    }

    headerBase64, payloadBase64, original := parts[0], parts[1], parts[2]

    messageToSign := headerBase64 + "." + payloadBase64
    secret := os.Getenv("JWT_SECRET")

    h := hmac.New(sha256.New, []byte(secret))
    h.Write([]byte(messageToSign))
    calculatedSignature := base64.RawURLEncoding.EncodeToString(h.Sum(nil))

    if original != calculatedSignature {
      response.Error(w, http.StatusUnauthorized, "SIGNATURE_VERIFICATION_FAILED")
      return
    }

    payloadBytes, err := base64.RawURLEncoding.DecodeString(payloadBase64)
    if err != nil {
      response.Error(w, http.StatusUnauthorized, "CANNOT_DECODE_PAYLOAD")
      return
    }

    var data tokenPayload
    if err := json.Unmarshal(payloadBytes, &data); err != nil {
      response.Error(w, http.StatusUnauthorized, "CANNOT_PARSE_PAYLOAD_JSON")
      return
    }

    if time.Now().Unix() > data.Exp {
      response.Error(w, http.StatusUnauthorized, "TOKEN_EXPIRED")
      return
    }

    next(w, r)
  }
}
