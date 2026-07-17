import { toast } from "react-toastify";

export const handleErrors = (status: number) => {
  switch(status) {
    case 401:
      toast.error('Unauthorized. Please log in again.');
      break;
    case 403:
      toast.error(`Session expired. Please log in again.`);
      break;
    case 404:
      toast.error('Resource not found');
      break;
    case 500:
      toast.error('Something unexpected went wrong.Please try again.');
      break;
    default:
      toast.error('Operation Failed. Please try again');
  }
};