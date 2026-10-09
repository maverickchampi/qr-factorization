package main

import (
  "bufio"
  "fmt"
  "net/http"
  "os"
  "strings"

  "qr-factorization-api/internal/auth"
  "qr-factorization-api/internal/factorization"
)

func main() {
  LoadEnv()

  mux := http.NewServeMux()

  mux.HandleFunc("POST /api/v1/login", auth.LoginHandler)
  mux.HandleFunc("GET /api/v1/validate", auth.Middleware(auth.ValidateHandler))
  mux.HandleFunc("POST /api/v1/factorization", auth.Middleware(factorization.Handler))

  port := os.Getenv("PORT")
  if port == "" {
    port = "8080"
  }

  fmt.Printf("Server running on port %s\n", port)
  http.ListenAndServe(":"+port, middlewareCORS(mux))
}

func LoadEnv() {
  file, err := os.Open(".env")
  if err != nil {
    return
  }
  defer file.Close()

  scanner := bufio.NewScanner(file)
  for scanner.Scan() {
    line := scanner.Text()
    if len(line) == 0 || strings.HasPrefix(line, "#") {
      continue
    }

    parts := strings.SplitN(line, "=", 2)
    if len(parts) == 2 {
      os.Setenv(strings.TrimSpace(parts[0]), strings.TrimSpace(parts[1]))
    }
  }
}

func middlewareCORS(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", os.Getenv("ALLOWED_ORIGIN"))
    w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
    w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

    if r.Method == "OPTIONS" {
      w.WriteHeader(http.StatusOK)
      return
    }

    next.ServeHTTP(w, r)
  })
}
