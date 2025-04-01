"use server";
import {
  Document,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  BorderStyle,
  WidthType,
  HeightRule,
} from "docx";
import { Packer } from "docx";
import generateDocument from "./docxReport";

const bor = {
  top: {
    style: BorderStyle.THICK,
    size: 10,
    color: "FF0000",
  },
  bottom: {
    style: BorderStyle.THICK,
    size: 10,
    color: "FF0000",
  },
  left: {
    style: BorderStyle.THICK,
    size: 10,
    color: "FF0000",
  },
  right: {
    style: BorderStyle.THICK,
    size: 10,
    color: "FF0000",
  },
};

const lowScoreColor = "FFA500"; // orange - looks better but we shall see
// const lowScoreColor = "f87171"; // lightish-red
const highScoreColor = "ffff00"; // yellow

// Function to convert sex abbreviation
function getSexFull(sex: string) {
  if (sex === "Stallion") return "S";
  if (sex === "Mare") return "F";
  if (sex === "Gelding") return "G";
  return sex;
}

// Function to create the horse table
function createHorseTable(horseData: any) {
  const horses =
    typeof horseData === "string" ? JSON.parse(horseData) : horseData;
  const rows = [];

  // Header row
  rows.push(
    new TableRow({
      children: [
        createHeaderCell("NAME"),
        createHeaderCell("BREED"),
        createHeaderCell("AGE"),
        createHeaderCell("SEX"),
        createHeaderCell("COLOR"),
        createHeaderCell("TIME ON FARM"),
        createHeaderCell("BCS"),
      ],
      height: {
        value: 100, // height in twentieths of a point (500 = 25 pts)
        rule: HeightRule.ATLEAST, // or EXACT
      },
    })
  );

  // Data rows for each horse
  horses.forEach((horse: any) => {
    // Main data row
    let bcsScoreColor = "ffffff"; // white
    if (horse.isHorse) {
      if (horse.bcsScore < 4) {
        bcsScoreColor = lowScoreColor;
      } else if (horse.bcsScore > 6) {
        bcsScoreColor = highScoreColor;
      }
    } else if (!horse.isHorse) {
      // i.e. it is a donkey
      if (horse.bcsScore < 3) {
        bcsScoreColor = lowScoreColor;
      } else if (horse.bcsScore > 3) {
        bcsScoreColor = highScoreColor;
      }
    }
    // TODO: Not sure about shading limits for donkey

    rows.push(
      new TableRow({
        children: [
          createCell(`${horse.isHorse ? "" : "(DONKEY) "}${horse.name}`, {
            rowSpan: 2,
          }),
          createCell(horse.breed),
          createCell(`${horse.age}`),
          createCell(getSexFull(horse.sex)),
          createCell(horse.color),
          createCell(`${horse.timeOnFarm} ${horse.timeUnit}`),
          createCell(`${horse.bcsScore}/${horse.isHorse ? "9" : "5"}`, {
            shading: {
              fill: bcsScoreColor,
            },
          }),
        ],
      })
    );

    // Notes row
    const horseFinding = horse.notes ? horse.notes : "N/A - Not Provided";
    rows.push(
      new TableRow({
        children: [
          createCell("PE findings: " + horseFinding, { columnSpan: 7 }),
        ],
        height: {
          value: 1000, // height in twentieths of a point (500 = 25 pts)
          rule: HeightRule.ATLEAST, // or EXACT
        },
      })
    );
  });

  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows,
  });
}

// Helper function to create header cells
function createHeaderCell(text: string) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: true,
          }),
        ],
      }),
    ],
    margins: {
      top: 100, // in twentieths of a point → 100 = 5pt
      bottom: 100,
      left: 100,
      right: 100,
    },
    borders: bor,
  });
}

interface CellOptions {
  columnSpan?: number;
  rowSpan?: number;
  shading?: any;
}

function createCell(text: string, options: CellOptions = {}) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text || "",
          }),
        ],
      }),
    ],
    columnSpan: options?.columnSpan,
    rowSpan: options?.rowSpan,
    margins: {
      top: 100, // in twentieths of a point → 100 = 5pt
      bottom: 100,
      left: 100,
      right: 100,
    },
    shading: options?.shading,
  });
}

export async function generateHorseDoc(horseData: any) {
  // Create a new document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "Table 1: Summary of horse information. Low Body Condition Scores (BCS) are highlighted in yellow. Normal BCS for horses in this herd are considered to be 4-6/9.",
            spacing: {
              after: 200,
            },
          }),
          createHorseTable(horseData),
        ],
      },
    ],
  });

  const docBlob: Blob = await Packer.toBlob(doc);
  console.log("Document created successfully");

  return docBlob;
}

export async function generateReportDoc(data: any) {
  // Use the imported generateDocument function directly with the provided data
  const doc = generateDocument(data);

  const docBlob: Blob = await Packer.toBlob(doc);
  console.log("Document created successfully");

  return docBlob;
}
