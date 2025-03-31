import { AlignmentType, Document, PageBreak, Paragraph, TextRun } from "docx";

// Add type definitions for the report data structure
interface Requirement {
  complianceStatus: string;
  findings?: string;
  text: string;
}

interface Subsection {
  name: string;
  requirements: Requirement[];
}

interface Section {
  id: number;
  title: string;
  subsections: Subsection[];
}

interface ReportData {
  metadata: {
    displayName: string;
    farmName: string;
    id: string;
    vetName: string;
    visitDate: string;
  };
  nonCompliantFindings: {
    sections: Section[];
  };
  sideNotes: string;
}

/**
 * Generates a document for equine welfare reports
 * @param {ReportData} reportData - Data for the report
 * @returns {docx.Document}
 * @see https://docx.js.org/
 */
function generateDocument(reportData: any) {
  // Use provided data or fallback to sample data
  const data: ReportData =
    typeof reportData === "string" ? JSON.parse(reportData) : reportData;

  const paragraphs = [];

  // Header with dynamic metadata.
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `REPORT OF VISIT TO ${data.metadata.farmName.toUpperCase()}`,
          bold: true,
          size: 32,
        }),
      ],
      spacing: { after: 100 },
      alignment: AlignmentType.CENTER,
    })
  );
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Veterinarian: ${data.metadata.vetName}`,
          color: "0000FF", // Blue
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Visit Date: ${data.metadata.visitDate}`,
          color: "0000FF", // Blue
          size: 24,
        }),
      ],
      spacing: { after: 400 },
      alignment: AlignmentType.CENTER,
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'The purpose for my visit was to assess the overall health and welfare of the horses on the farm on this day at this time. For reference I have used the "Code of Practice for the Care and Handling of Equines" developed by the National Farm Animal Care Council, as well as the ',
          size: 22,
        }),
        new TextRun({
          text: '"PEI Animal Welfare Act."',
          size: 22,
          italics: true,
        }),
      ],
      spacing: { after: 300 },
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "The Code of Practice for the Care and Handling of Equines states that ",
          size: 22,
        }),
        new TextRun({
          text: "the most significant influence on the welfare of equines is the care and management provided by the person(s) responsible for their daily care",
          size: 22,
          bold: true,
          underline: {
            type: "single",
          },
        }),
        new TextRun({
          text: ". Those responsible for equines should consider the following:",
          size: 22,
        }),
      ],
      spacing: { after: 300 },
    })
  );

  // List of Code of Practice bullet points (static, blue text).
  const codePoints = [
    "Shelter",
    "Feed and water to maintain health and vigor",
    "Freedom of movement and exercise for most normal behaviors",
    "The company of other equines",
    "Veterinary care, diagnosis and treatment, disease control and prevention",
    "Emergency preparedness for fire, natural disaster, and the disruption of feed supplies",
    "Hoof care",
    "End of life",
  ];
  codePoints.forEach((point) => {
    paragraphs.push(
      new Paragraph({
        bullet: { level: 0 },
        children: [
          new TextRun({
            text: point,
            size: 22,
            italics: true,
          }),
        ],
      })
    );
  });

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "An animal's welfare should be considered in terms of the five freedoms:",
          size: 22,
        }),
      ],
      spacing: { before: 300, after: 100 },
    })
  );

  const freedoms = [
    [
      "Freedom from Hunger and Thirst",
      "By ready access to fresh water and a diet to maintain full health and vigor",
    ],
    [
      "Freedom from Discomfort",
      "By providing an appropriate environment including shelter and a comfortable resting area",
    ],
    [
      "Freedom from Pain, Injury and Disease",
      "By prevention or rapid diagnosis and treatment",
    ],
    [
      "Freedom to Express Normal Behavior",
      "By providing sufficient space, proper facilities and company of the animal's own kind",
    ],
    [
      "Freedom from Fear and Distress",
      "By ensuring conditions and treatment which avoid mental suffering",
    ],
  ];
  freedoms.forEach((freedom) => {
    paragraphs.push(
      new Paragraph({
        bullet: { level: 0 },
        children: [
          new TextRun({
            text: freedom[0],
            size: 22,
          }),
        ],
      }),
      new Paragraph({
        bullet: { level: 1 },
        children: [
          new TextRun({
            text: freedom[1],
            size: 22,
          }),
        ],
      })
    );
  });

  // Insert a static quote (blue text) regarding the responsibility for care.
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '"All herd sizes require adequate human resources to ensure the observation, care and welfare of individual animals. Neither financial cost nor any other circumstances should result in a delay in treatment or neglect of animals".',
          size: 22,
          italics: true,
          bold: true,
        }),
        new PageBreak(),
      ],
      spacing: { after: 400, before: 400 },
      alignment: AlignmentType.CENTER,
    })
  );

  // SECTION 1 - DUTY OF CARE (if available in your JSON, else use a placeholder)
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "SECTION 1 - DUTY OF CARE",
          bold: true,
          color: "0000FF",
          size: 26,
        }),
      ],

      spacing: { after: 200 },
    })
  );
  // Duty of Care explanation (static, blue text)
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `CODE 1 refers to DUTY OF CARE stating `,
          size: 22,
        }),
        new TextRun({
          text: `\"Horses, donkeys, and mules can live for 30 years or longer. Ownership of these animals can be a great pleasure, but is also a significant responsibility associated with a long-term commitment of time and money. Owners and staff have a DUTY OF CARE for the animals they are permanently or temporarily responsible for. If an owner leaves the animal in the care of another person, it is the owner's duty to ensure the person is competent and has the necessary authority to act in an emergency.\"`,
          size: 22,
          italics: true,
        }),
      ],
    })
  );

  // Responsibility for an animal (static, blue text)
  paragraphs.push(
    new Paragraph({
      bullet: { level: 0 },
      children: [
        new TextRun({
          text: `Responsibility for an animal includes having an understanding of their specific health and welfare needs, and having the appropriate knowledge and skills to care for the animal.  Those responsible will also have to comply with relevant legislation and be aware of the Requirements and Recommended Practices in this Code.  They should also know when to seek advice from a knowledgeable person.`,
          size: 22,
          italics: true,
        }),
      ],
      spacing: { after: 300, before: 200 },
    })
  );
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "<<placeholder: all findings in section 1>>",
          highlight: "yellow", // Yellow for dynamic findings
          size: 22,
        }),
      ],
      spacing: { after: 400 },
    })
  );

  // Placeholder for conditions that day, people who joined, weather (dynamic text)
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "<<conditions that day, people who joined, weather>>",
          highlight: "yellow", // Highlight for dynamic findings
          size: 22,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // Placeholder for total horses, farm conditions, etc. (dynamic text)
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "<<placeholder: total horses, farm conditions, etc.>>",
          highlight: "yellow", // Highlight for dynamic findings
          size: 22,
        }),
        new PageBreak(),
      ],
      spacing: { after: 200 },
    })
  );

  data.nonCompliantFindings.sections.forEach((section: Section) => {
    let allFindings: TextRun[] = [];

    // Add section title
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `SECTION ${section.id} – ${section.title}`,
            bold: true,
            size: 26,
            allCaps: true,
          }),
        ],
        spacing: { after: 200 },
      })
    );

    // Aggregate all findings for the section
    section.subsections.forEach((subsection: Subsection) => {
      subsection.requirements.forEach((req: Requirement) => {
        if (req.findings) {
          allFindings.push(
            new TextRun({
              text: `${req.findings}\n`,
              color: "0000ff", // Blue color for findings
              size: 22,
            })
          );
        }
      });
    });

    // Add ALL FINDINGS before subsections
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "All Findings Combined:",
            bold: true,
            size: 22,
          }),
        ],
      })
    );
    paragraphs.push(
      new Paragraph({
        children: allFindings, // Add all findings aggregated here
        spacing: { after: 200 },
      })
    );

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Based on my findings, the owner is not in compliance with the following requirements:",
            size: 22,
          }),
        ],
        spacing: { after: 100 },
      })
    );

    // Now render subsections and their requirements

    section.subsections.forEach((subsection: Subsection) => {
      // Add subsection name
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({
              text: `Code `,
              size: 22,
            }),
            new TextRun({
              text: subsection.name,
              bold: true,
              underline: {
                type: "single",
              },
              size: 22,
            }),
            new TextRun({
              text: ` refers to,`,
              size: 22,
            }),
          ],
          spacing: { after: 100 },
        })
      );

      // Loop through each requirement in the subsection
      subsection.requirements.forEach((req: Requirement) => {
        // Add requirement text
        paragraphs.push(
          new Paragraph({
            bullet: { level: 1 },
            children: [
              new TextRun({
                text: `Requirement: "`,
                color: "008000", // Green for requirements
                size: 22,
                italics: true,
                bold: true,
              }),
              new TextRun({
                text: req.text,
                color: "008000", // Green for requirements
                size: 22,
              }),
              new TextRun({
                text: `"`,
                color: "008000", // Green for requirements
                size: 22,
                italics: true,
                bold: true,
              }),
            ],
            spacing: { after: 100 },
          })
        );
        if (req.findings?.length ?? 0 > 0) {
          paragraphs.push(
            new Paragraph({
              bullet: { level: 2 },
              children: [
                new TextRun({
                  text: `Finding: "`,
                  color: "008000", // Green for requirements
                  size: 22,
                  italics: true,
                  bold: true,
                }),
                new TextRun({
                  text: req.findings,
                  color: "0000ff", // Green for requirements
                  size: 22,
                }),
                new TextRun({
                  text: `"`,
                  color: "008000", // Green for requirements
                  size: 22,
                  italics: true,
                  bold: true,
                }),
              ],
              spacing: { after: 100 },
            })
          );
        }
      });
    });

    paragraphs.push(
      new Paragraph({
        children: [],
        spacing: { after: 500 },
      })
    );
  });

  // Recommendations and recommended action (static content with placeholders)
  paragraphs.push(
    new Paragraph({
      children: [
        new PageBreak(),
        new TextRun({
          text: "RECOMMENDATIONS:",
          bold: true,
          size: 24,
        }),
      ],
      spacing: { after: 150 },
    })
  );

  // These recommendations can be static or generated dynamically if available.
  const recommendations = ["1. ....", "2. ...."];
  recommendations.forEach((rec) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: rec,
            size: 22,
          }),
        ],
        spacing: { after: 150 },
      })
    );
  });

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "RECOMMENDED ACTION:",
          bold: true,
          size: 24,
        }),
      ],
      spacing: { after: 150, before: 300 },
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Overall, the herd was in poor body condition with BCS ranging from ",
          size: 22,
        }),
        new TextRun({
          text: "<<lowest-BCS-Score-in-herd>>",
          color: "0000ff",
          bold: true,
        }),
        new TextRun({
          text: "/9 to ",
        }),
        new TextRun({
          text: "<<highest-BCS-Score-herd/9>>",
          color: "0000ff",
          bold: true,
        }),
        new TextRun({
          text: ". A mean herd BCS of ",
        }),
        new TextRun({
          text: "<< to be calculated >>",
          color: "0000ff",
          bold: true,
        }),
        new TextRun({
          text: "/9.",
        }),
      ],
      spacing: { after: 150 },
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Due to the findings of the investigation and assessment of the animals, it is my recommendation ",
          size: 22,
        }),
        new TextRun({
          text: "...... <<Enter you recommendation here OR delete this block if NO Recommendation>>.",
          size: 22,
          color: "0000ff",
          bold: true,
        }),
      ],
      spacing: { after: 500 },
    })
  );

  // Signature block.
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Sincerely,",
          size: 22,
          bold: true,
        }),
      ],
      spacing: { after: 100 },
    })
  );
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${data.metadata.vetName}`,
          size: 22,
          bold: true,
        }),
      ],
      spacing: { after: 100 },
    })
  );
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Dated: ${data.metadata.visitDate}`,
          size: 22,
          bold: true,
        }),
      ],
    })
  );

  // Side notes section – split by newline to preserve formatting.
  if (data.sideNotes) {
    paragraphs.push(
      new Paragraph({
        children: [
          new PageBreak(),
          new TextRun({
            text: "Additional Notes:",
            bold: true,
            size: 24,
          }),
        ],
        spacing: { after: 200 },
      })
    );

    data.sideNotes.split("\n").forEach((line: string) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 22,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
          },
        },
      },
    },
  });
  return doc;
}

export default generateDocument;
