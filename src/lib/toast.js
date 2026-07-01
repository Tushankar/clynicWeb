import { toast } from 'sonner';

export { toast };

/** Surface an ApiError (or any error) as a toast with the server message when present. */
export function toastApiError(error, fallback = 'Something went wrong') {
  const msg = error?.body?.message || error?.message || fallback;
  toast.error(msg);
}
