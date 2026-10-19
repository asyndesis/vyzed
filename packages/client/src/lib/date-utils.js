import dayjs from "dayjs";
import "dayjs/locale/en-gb"; // Example: Spanish

export const formatDate = (
  timestamp,
  formatString = "MMMM D, YYYY h:mm:ss A",
) => {
  return dayjs(timestamp).format(formatString);
};
