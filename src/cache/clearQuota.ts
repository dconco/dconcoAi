import { quotaFilePath } from "../utils/loadCaches";
import { writeFile } from "fs";

writeFile(quotaFilePath, JSON.stringify({ contacts: [] }, null, 2), (err) => {
   if (err) {
      console.error('Error clearing quota file:', err);
   } else {
      console.log('Quota file cleared successfully.');
   }
});