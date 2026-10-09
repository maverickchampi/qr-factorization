package main

import (
  "net/http"
  "net/http/httptest"
  "testing"
)

func TestMiddlewareCORS(t *testing.T) {
  t.Setenv("ALLOWED_ORIGIN", "http://localhost:5173")

  next := func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
  }
  handler := middlewareCORS(http.HandlerFunc(next))

  req := httptest.NewRequest(http.MethodOptions, "/api/v1/login", nil)
  rec := httptest.NewRecorder()

  handler.ServeHTTP(rec, req)

  if rec.Code != http.StatusOK {
    t.Fatalf("preflight status = %d, want %d", rec.Code, http.StatusOK)
  }
  if got := rec.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:5173" {
    t.Fatalf("Allow-Origin = %q, want %q", got, "http://localhost:5173")
  }

  req = httptest.NewRequest(http.MethodPost, "/api/v1/login", nil)
  rec = httptest.NewRecorder()

  handler.ServeHTTP(rec, req)

  if rec.Code != http.StatusOK {
    t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
  }
}
