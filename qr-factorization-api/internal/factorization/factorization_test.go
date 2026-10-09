package factorization

import (
  "encoding/json"
  "math"
  "net/http"
  "net/http/httptest"
  "strings"
  "testing"
)

type result struct {
  Q [][]float64 `json:"q"`
  R [][]float64 `json:"r"`
}

func naiveMultiply(a, b [][]float64) [][]float64 {
  rows := len(a)
  cols := len(b[0])
  inner := len(b)
  out := make([][]float64, rows)
  for i := range out {
    out[i] = make([]float64, cols)
    for j := 0; j < cols; j++ {
      sum := 0.0
      for k := 0; k < inner; k++ {
        sum += a[i][k] * b[k][j]
      }
      out[i][j] = sum
    }
  }
  return out
}

func assertClose(t *testing.T, name string, got, want float64) {
  t.Helper()
  if math.Abs(got-want) > 1e-9 {
    t.Fatalf("%s = %v, want %v", name, got, want)
  }
}

func decodeResult(t *testing.T, rec *httptest.ResponseRecorder) result {
  t.Helper()
  var resp struct {
    Success bool   `json:"success"`
    Data    result `json:"data"`
  }
  if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
    t.Fatalf("decode response: %v", err)
  }
  if !resp.Success {
    t.Fatalf("success = false, want true")
  }
  return resp.Data
}

func TestHandlerSuccess(t *testing.T) {
  matrix := [][]float64{{12, -51, 4}, {6, 167, -68}, {-4, 24, -41}}
  body := `{"matrix":[[12,-51,4],[6,167,-68],[-4,24,-41]]}`
  req := httptest.NewRequest(http.MethodPost, "/api/v1/factorization", strings.NewReader(body))
  rec := httptest.NewRecorder()

  Handler(rec, req)

  if rec.Code != http.StatusOK {
    t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
  }

  data := decodeResult(t, rec)

  if len(data.Q) != 3 || len(data.R) != 3 {
    t.Fatalf("unexpected dimensions Q=%dx? R=%dx?", len(data.Q), len(data.R))
  }

  product := naiveMultiply(data.Q, data.R)
  for i := range matrix {
    for j := range matrix[i] {
      assertClose(t, "A[i][j]", product[i][j], matrix[i][j])
    }
  }
}

func TestHandlerRectangularTall(t *testing.T) {
  matrix := [][]float64{{1, 2}, {3, 4}, {5, 6}}
  body := `{"matrix":[[1,2],[3,4],[5,6]]}`
  req := httptest.NewRequest(http.MethodPost, "/api/v1/factorization", strings.NewReader(body))
  rec := httptest.NewRecorder()

  Handler(rec, req)

  if rec.Code != http.StatusOK {
    t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
  }

  data := decodeResult(t, rec)

  if len(data.Q) != 3 || len(data.Q[0]) != 3 {
    t.Fatalf("Q dimensions = %dx%d, want 3x3", len(data.Q), len(data.Q[0]))
  }
  if len(data.R) != 3 || len(data.R[0]) != 2 {
    t.Fatalf("R dimensions = %dx%d, want 3x2", len(data.R), len(data.R[0]))
  }

  product := naiveMultiply(data.Q, data.R)
  for i := range matrix {
    for j := range matrix[i] {
      assertClose(t, "A[i][j]", product[i][j], matrix[i][j])
    }
  }
}

func TestHandlerValidation(t *testing.T) {
  tests := []struct {
    name string
    body string
    want int
  }{
    {"invalid body", "not-json", http.StatusBadRequest},
    {"missing matrix", `{}`, http.StatusBadRequest},
    {"empty matrix", `{"matrix":[]}`, http.StatusBadRequest},
    {"empty row", `{"matrix":[[1,2],[]]}`, http.StatusBadRequest},
    {"ragged matrix", `{"matrix":[[1,2],[3]]}`, http.StatusBadRequest},
  }

  for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
      req := httptest.NewRequest(http.MethodPost, "/api/v1/factorization", strings.NewReader(tt.body))
      rec := httptest.NewRecorder()

      Handler(rec, req)

      if rec.Code != tt.want {
        t.Fatalf("status = %d, want %d", rec.Code, tt.want)
      }
    })
  }
}

func TestFactorizeQRIsOrthogonal(t *testing.T) {
  matrix := [][]float64{{12, -51, 4}, {6, 167, -68}, {-4, 24, -41}}
  q, _ := factorizeQR(matrix)

  for i := range q {
    for j := range q {
      dot := 0.0
      for k := range q {
        dot += q[k][i] * q[k][j]
      }
      want := 0.0
      if i == j {
        want = 1.0
      }
      assertClose(t, "Q^T Q", dot, want)
    }
  }
}

func TestFactorizeQRZeroColumn(t *testing.T) {
  matrix := [][]float64{{0, 1}, {0, 2}, {0, 3}}
  q, r := factorizeQR(matrix)

  product := naiveMultiply(q, r)
  for i := range matrix {
    for j := range matrix[i] {
      assertClose(t, "A[i][j]", product[i][j], matrix[i][j])
    }
  }
}
