package auth

import (
  "crypto/hmac"
  "crypto/sha256"
  "encoding/base64"
  "encoding/json"
  "fmt"
  "net/http"
  "net/http/httptest"
  "strings"
  "testing"
  "time"
)

func buildJwt(secret, email string, exp int64) string {
  header := base64.RawURLEncoding.EncodeToString([]byte(`{"alg":"HS256","typ":"JWT"}`))
  payload := base64.RawURLEncoding.EncodeToString([]byte(fmt.Sprintf(`{"sub":"%s","exp":%d}`, email, exp)))
  message := header + "." + payload
  h := hmac.New(sha256.New, []byte(secret))
  h.Write([]byte(message))
  return message + "." + base64.RawURLEncoding.EncodeToString(h.Sum(nil))
}

func TestLoginHandlerSuccess(t *testing.T) {
  t.Setenv("API_EMAIL", "admin@admin.com")
  t.Setenv("API_PASSWORD", "admin")
  t.Setenv("JWT_SECRET", "test-secret")

  body := `{"email":"admin@admin.com","password":"admin"}`
  req := httptest.NewRequest(http.MethodPost, "/api/v1/login", strings.NewReader(body))
  rec := httptest.NewRecorder()

  LoginHandler(rec, req)

  if rec.Code != http.StatusOK {
    t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
  }

  var resp struct {
    Success bool `json:"success"`
    Data    struct {
      Token string `json:"token"`
    } `json:"data"`
  }
  if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
    t.Fatalf("decode response: %v", err)
  }
  if !resp.Success {
    t.Fatalf("success = false, want true")
  }
  if resp.Data.Token == "" {
    t.Fatalf("token is empty")
  }
}

func TestLoginHandlerInvalidCredentials(t *testing.T) {
  t.Setenv("API_EMAIL", "admin@admin.com")
  t.Setenv("API_PASSWORD", "admin")

  body := `{"email":"admin@admin.com","password":"wrong"}`
  req := httptest.NewRequest(http.MethodPost, "/api/v1/login", strings.NewReader(body))
  rec := httptest.NewRecorder()

  LoginHandler(rec, req)

  if rec.Code != http.StatusUnauthorized {
    t.Fatalf("status = %d, want %d", rec.Code, http.StatusUnauthorized)
  }
}

func TestLoginHandlerInvalidBody(t *testing.T) {
  req := httptest.NewRequest(http.MethodPost, "/api/v1/login", strings.NewReader("not-json"))
  rec := httptest.NewRecorder()

  LoginHandler(rec, req)

  if rec.Code != http.StatusBadRequest {
    t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
  }
}

func TestValidateHandler(t *testing.T) {
  req := httptest.NewRequest(http.MethodGet, "/api/v1/validate", nil)
  rec := httptest.NewRecorder()

  ValidateHandler(rec, req)

  if rec.Code != http.StatusOK {
    t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
  }
}

func TestMiddleware(t *testing.T) {
  const secret = "test-secret"
  t.Setenv("JWT_SECRET", secret)

  next := func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
  }
  handler := Middleware(next)

  valid := buildJwt(secret, "admin@admin.com", time.Now().Add(time.Minute).Unix())
  badSignature := buildJwt("other-secret", "admin@admin.com", time.Now().Add(time.Minute).Unix())
  expired := buildJwt(secret, "admin@admin.com", time.Now().Add(-time.Minute).Unix())

  tests := []struct {
    name   string
    header string
    want   int
  }{
    {"missing header", "", http.StatusUnauthorized},
    {"invalid scheme", "Token abc", http.StatusUnauthorized},
    {"malformed token", "Bearer abc.def", http.StatusUnauthorized},
    {"bad signature", "Bearer " + badSignature, http.StatusUnauthorized},
    {"expired token", "Bearer " + expired, http.StatusUnauthorized},
    {"valid bearer", "Bearer " + valid, http.StatusOK},
  }

  for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
      req := httptest.NewRequest(http.MethodGet, "/api/v1/validate", nil)
      if tt.header != "" {
        req.Header.Set("Authorization", tt.header)
      }
      rec := httptest.NewRecorder()

      handler(rec, req)

      if rec.Code != tt.want {
        t.Fatalf("status = %d, want %d", rec.Code, tt.want)
      }
    })
  }
}
