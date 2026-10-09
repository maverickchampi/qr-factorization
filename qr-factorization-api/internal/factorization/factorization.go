package factorization

import (
  "encoding/json"
  "math"
  "net/http"

  "qr-factorization-api/internal/response"
)

type request struct {
  Matrix [][]float64 `json:"matrix"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
  var req request
  if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
    response.Error(w, http.StatusBadRequest, "INVALID_REQUEST_BODY")
    return
  }

  if len(req.Matrix) == 0 {
    response.Error(w, http.StatusBadRequest, "MATRIX_REQUIRED")
    return
  }

  cols := len(req.Matrix[0])
  for _, row := range req.Matrix {
    if len(row) == 0 {
      response.Error(w, http.StatusBadRequest, "INVALID_MATRIX_EMPTY_ROW")
      return
    }
    if len(row) != cols {
      response.Error(w, http.StatusBadRequest, "INVALID_MATRIX_RAGGED")
      return
    }
  }

  q, rMatrix := factorizeQR(req.Matrix)

  response.Success(w, http.StatusOK, map[string][][]float64{
    "q": q,
    "r": rMatrix,
  })
}

func factorizeQR(matrix [][]float64) ([][]float64, [][]float64) {
  rows := len(matrix)
  cols := len(matrix[0])

  r := make([][]float64, rows)
  for i := range r {
    r[i] = make([]float64, cols)
    copy(r[i], matrix[i])
  }

  q := make([][]float64, rows)
  for i := range q {
    q[i] = make([]float64, rows)
    q[i][i] = 1
  }

  limit := cols
  if rows < cols {
    limit = rows
  }

  for j := 0; j < limit; j++ {
    for i := rows - 1; i > j; i-- {
      x := r[j][j]
      y := r[i][j]

      if y == 0 {
        continue
      }

      norm := math.Hypot(x, y)
      c := x / norm
      s := y / norm

      for k := 0; k < cols; k++ {
        rj := r[j][k]
        ri := r[i][k]
        r[j][k] = c*rj + s*ri
        r[i][k] = -s*rj + c*ri
      }

      for k := 0; k < rows; k++ {
        qj := q[k][j]
        qi := q[k][i]
        q[k][j] = c*qj + s*qi
        q[k][i] = -s*qj + c*qi
      }
    }
  }

  for i := range r {
    for k := range r[i] {
      if math.Abs(r[i][k]) < 1e-12 {
        r[i][k] = 0
      }
    }
  }

  for i := range q {
    for k := range q[i] {
      if math.Abs(q[i][k]) < 1e-12 {
        q[i][k] = 0
      }
    }
  }

  return q, r
}
