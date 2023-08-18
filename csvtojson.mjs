import csvtojson from "csvtojson";
import { writeFile } from "fs/promises";

const transform = () =>
  csvtojson()
    .fromFile("db.csv")
    .then((jsonObj) => {
      const newArray = jsonObj.map((obj) => {
        return {
          date: obj.ENERO,
          id: obj.field2,
          name: obj.field3,
          dni: obj.field4,
          description: obj.field5,
          base: obj.field6,
          iva: obj.field7,
          irpf: obj.field8,
          total: obj.field9,
        };
      });
      writeFile("./invoices_db.json", JSON.stringify(newArray), (err) => {
        if (err) {
          console.error(err);
        }
        console.error("DB updated");
      });
    });

transform();
