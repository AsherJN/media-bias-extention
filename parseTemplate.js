const fs = require('fs');

// Read the template file
const templateContent = fs.readFileSync('aiBiasTemplate.txt', 'utf8');

// Split the content by the delimiter lines
const delimiter = '────────────────────────────────────────────────────────────────────────';
const sections = templateContent.split(delimiter).map(section => section.trim());

// Initialize the JSON structure
const jsonStructure = {
  metadata: {
    version: "1.0",
    description: "Media Bias Analyzer prompt configuration"
  },
  promptSections: {},
  dashboardItems: [],
  taskInstructions: {
    title: "Task Instructions",
    content: "",
    isEditable: true
  },
  outputSchema: {
    title: "Required JSON Schema",
    content: "",
    isEditable: true
  }
};

// Process the role section (first section)
if (sections.length > 0) {
  jsonStructure.promptSections.role = {
    title: "Role",
    content: sections[0],
    isEditable: true,
    order: 1
  };
}

// Process the context section (second section)
if (sections.length > 1) {
  jsonStructure.promptSections.context = {
    title: "Context",
    content: sections[1],
    isEditable: true,
    order: 2
  };
}

// Process dashboard items (sections 2 to 9)
for (let i = 2; i < 10 && i < sections.length; i++) {
  const section = sections[i];
  
  // Extract title and JSON ID
  const titleMatch = section.match(/\*\*Dashboard Item \d+\*\*\s*\n*Title:\s*([^\n]+)/);
  const jsonIdMatch = section.match(/JSON ID:\s*"([^"]+)"/);
  const wordCountMatch = section.match(/Word Count:\s*([^\n]+)/);
  const definitionMatch = section.match(/Definition:\s*([^]*?)(?=How to Assess:|$)/);
  
  // Extract assessment criteria
  const assessmentMatch = section.match(/How to Assess:\s*([^]*?)(?=Key Questions:|$)/);
  
  // Extract key questions
  const keyQuestionsMatch = section.match(/Key Questions:?\s*([^]*?)(?=$)/);
  
  // Create dashboard item object
  const dashboardItem = {
    id: jsonIdMatch ? jsonIdMatch[1] : `dashboard_item_${i-1}`,
    title: titleMatch ? titleMatch[1] : `Dashboard Item ${i-1}`,
    description: definitionMatch ? definitionMatch[1].trim() : "",
    wordLimit: wordCountMatch ? parseInt(wordCountMatch[1].replace(/[^\d]/g, '')) || null : null,
    assessmentCriteria: [],
    keyQuestions: [],
    isVisible: true,
    order: i-1
  };
  
  // Fix title for dashboard item 8 (Publisher Bias)
  if (dashboardItem.id === "dashboard_item_8" || (i === 9 && dashboardItem.description.includes("outlet's historical ideological lean"))) {
    dashboardItem.title = "Publisher Bias";
  }
  
  // Process assessment criteria
  if (assessmentMatch && assessmentMatch[1]) {
    const criteria = assessmentMatch[1].trim().split(/\n+/).map(line => {
      // Remove bullet points and trim
      return line.replace(/^[•\-\*]\s*/, '').trim();
    }).filter(line => line.length > 0);
    
    dashboardItem.assessmentCriteria = criteria;
  } else if (section.includes("How to Assess:")) {
    // Try to extract assessment criteria from the description if not found separately
    const descLines = dashboardItem.description.split(/\n+/);
    const assessIndex = descLines.findIndex(line => line.includes("How to Assess:"));
    
    if (assessIndex !== -1 && assessIndex < descLines.length - 1) {
      const keyQuestionsIndex = descLines.findIndex(line => line.includes("Key Questions"));
      const endIndex = keyQuestionsIndex !== -1 ? keyQuestionsIndex : descLines.length;
      
      const assessmentLines = descLines.slice(assessIndex + 1, endIndex);
      const criteria = assessmentLines.map(line => {
        return line.replace(/^[•\-\*]\s*/, '').trim();
      }).filter(line => line.length > 0 && !line.includes("Key Questions"));
      
      dashboardItem.assessmentCriteria = criteria;
    }
  }
  
  // Special case for analysis_summary (dashboard item 2)
  if (dashboardItem.id === "analysis_summary" && dashboardItem.assessmentCriteria.length === 0) {
    const descLines = dashboardItem.description.split(/\n+/);
    const assessLines = [];
    
    for (let j = 0; j < descLines.length; j++) {
      const line = descLines[j];
      if (line.includes("Metric Integration") || 
          line.includes("Neutral, Score‑Free Tone") || 
          line.includes("Scope & Relevance") || 
          line.includes("Clarity & Cohesion")) {
        assessLines.push(line);
      }
    }
    
    if (assessLines.length > 0) {
      dashboardItem.assessmentCriteria = assessLines;
    }
  }
  
  // Process key questions
  if (keyQuestionsMatch && keyQuestionsMatch[1]) {
    const questions = keyQuestionsMatch[1].trim().split(/\n+/).map(line => {
      // Remove bullet points and trim
      return line.replace(/^[•\-\*]\s*/, '').trim();
    }).filter(line => line.length > 0);
    
    dashboardItem.keyQuestions = questions;
  } else if (section.includes("Key Questions")) {
    // Try to extract key questions from the description if not found separately
    const descLines = dashboardItem.description.split(/\n+/);
    const keyQuestionsIndex = descLines.findIndex(line => line.includes("Key Questions"));
    
    if (keyQuestionsIndex !== -1 && keyQuestionsIndex < descLines.length - 1) {
      const questionLines = descLines.slice(keyQuestionsIndex + 1);
      const questions = questionLines.map(line => {
        return line.replace(/^[•\-\*]\s*/, '').trim();
      }).filter(line => line.length > 0);
      
      dashboardItem.keyQuestions = questions;
    }
  }
  
  // Special case for Historical Context (dashboard item 4)
  if (dashboardItem.id === "dashboard_item_4" && dashboardItem.keyQuestions.length === 0) {
    const descLines = dashboardItem.description.split(/\n+/);
    const keyQuestionsLines = [];
    
    for (let j = 0; j < descLines.length; j++) {
      const line = descLines[j];
      if (line.includes("Does the background illuminate") || 
          line.includes("Are citations present") || 
          line.includes("Is the writing neutral")) {
        keyQuestionsLines.push(line);
      }
    }
    
    if (keyQuestionsLines.length > 0) {
      dashboardItem.keyQuestions = keyQuestionsLines;
    }
  }
  
  jsonStructure.dashboardItems.push(dashboardItem);
}

// Process task instructions and output schema (last sections)
if (sections.length > 10) {
  // Find the task instructions section
  const taskSection = sections.find(section => section.includes("Task (step‑by‑step):"));
  if (taskSection) {
    const taskMatch = taskSection.match(/Task \(step‑by‑step\):\s*([^]*?)(?=Required JSON Schema|$)/);
    if (taskMatch && taskMatch[1]) {
      jsonStructure.taskInstructions.content = taskMatch[1].trim();
    }
    
    // Extract output schema
    const schemaMatch = taskSection.match(/Required JSON Schema\s*([^]*?)(?=$)/);
    if (schemaMatch && schemaMatch[1]) {
      jsonStructure.outputSchema.content = schemaMatch[1].trim();
    }
  }
}

// Write the JSON structure to file
fs.writeFileSync('dashboardItems.json', JSON.stringify(jsonStructure, null, 2));

console.log('Successfully parsed template and created dashboardItems.json');
