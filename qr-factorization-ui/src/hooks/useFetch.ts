import { useCallback, useState } from "react";
import errors from "../constants/errors";
import storage from "../constants/storage";
import { useSession } from "../context/session";
import { useToast } from "../context/toast";
import { ResponseError } from "../utils/errors";

interface Props {
  baseUrl: string;
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: object;
  hasAuthorization?: boolean;
  errorMessage?: string;
}

const useFetch = <T> ({ baseUrl, url, method, body, hasAuthorization = false, errorMessage }: Props) => {
  const { logout } = useSession();
  const { toast } = useToast();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (requestBody?: object): Promise<boolean> => {
    const bodyToSend = requestBody ?? body;
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(hasAuthorization && { Authorization: `Bearer ${localStorage.getItem(storage.TOKEN)}` })
        },
        body: bodyToSend ? JSON.stringify(bodyToSend) : undefined
      });

      if (response.status === 401 || response.status === 403) {
        throw new ResponseError(errors.INVALID_SESSION);
      }

      const result = await response.json();

      if(!result){
        throw new Error("Failed to fetch data");
      }

      if(!result.success) {
        throw new ResponseError(result.message);
      }

      if(result.data){
        setData(result.data);
      }

      return true;
    } catch (err) {
      if (err instanceof ResponseError && err.message === errors.INVALID_SESSION) {
        logout();
        toast("Sesión inválida. Inicia sesión nuevamente.", "error");
      } else {
        toast(errorMessage ?? "No se pudo conectar con el servidor.", "error");
      }

      setData(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, [url, method, body, hasAuthorization, errorMessage, logout, toast]);

  return { data, loading, fetchData };
};

export default useFetch;
