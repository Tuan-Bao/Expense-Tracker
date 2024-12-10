import { format } from "date-fns";

const formatDate = (date, formatString = "dd-MM-yyyy") => {
  return format(new Date(date), formatString);
};

export default formatDate;
