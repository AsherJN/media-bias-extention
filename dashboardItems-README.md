# Dashboard Items JSON Structure

This document explains the structure and purpose of the `dashboardItems.json` file, which contains the configuration for the Media Bias Analyzer's prompt and dashboard items.

## Overview

The `dashboardItems.json` file is a structured representation of the AI bias analysis prompt template. It breaks down the monolithic prompt into modular components that can be individually customized, toggled, or extended. This structure provides the groundwork for future enhancements such as:

- User customization of prompt sections
- Toggling dashboard items on/off
- Adding new analysis dimensions
- Reordering dashboard items
- Versioning and managing different prompt configurations

## JSON Structure

The file is organized into the following main sections:

### Metadata

```json
"metadata": {
  "version": "1.0",
  "description": "Media Bias Analyzer prompt configuration"
}
```

This section contains information about the configuration itself, including version tracking.

### Prompt Sections

```json
"promptSections": {
  "role": {
    "title": "Role",
    "content": "...",
    "isEditable": true,
    "order": 1
  },
  "context": {
    "title": "Context",
    "content": "...",
    "isEditable": true,
    "order": 2
  }
}
```

These are the introductory sections of the prompt that define the AI's role and the context for the analysis.

### Dashboard Items

```json
"dashboardItems": [
  {
    "id": "bias_score",
    "title": "Overall Bias Score",
    "description": "...",
    "wordLimit": null,
    "assessmentCriteria": [...],
    "keyQuestions": [...],
    "isVisible": true,
    "order": 1
  },
  // Additional dashboard items...
]
```

This array contains all the analysis dimensions (dashboard items) with their definitions, assessment criteria, and key questions. Each item has:

- **id**: Unique identifier used in the JSON output
- **title**: Display name for the dashboard item
- **description**: Detailed explanation of what this item measures
- **wordLimit**: Maximum word count for this analysis component (if applicable)
- **assessmentCriteria**: List of criteria for evaluating this dimension
- **keyQuestions**: Guiding questions to consider during analysis
- **isVisible**: Whether this item should be displayed (for future UI controls)
- **order**: The display order in the dashboard

### Task Instructions

```json
"taskInstructions": {
  "title": "Task Instructions",
  "content": "...",
  "isEditable": true
}
```

This section contains the step-by-step instructions for the AI to follow when analyzing an article.

### Output Schema

```json
"outputSchema": {
  "title": "Required JSON Schema",
  "content": "...",
  "isEditable": true
}
```

This section defines the expected JSON output format for the analysis results.

## Usage

This JSON structure can be used to:

1. **Generate the full prompt**: By concatenating the sections in the correct order
2. **Customize individual sections**: By modifying specific parts without affecting others
3. **Toggle dashboard items**: By setting `isVisible` to false for items that should be excluded
4. **Add new dashboard items**: By appending to the `dashboardItems` array
5. **Reorder components**: By changing the `order` values

## Integration

To integrate this JSON structure with the existing codebase:

1. Update `background.js` to read from `dashboardItems.json` instead of using the hardcoded template
2. Modify `popup.js` to use the JSON structure for displaying and editing prompt sections
3. Implement UI controls for toggling dashboard items on/off

## Future Enhancements

This JSON structure enables several future enhancements:

1. **User Customization UI**: Allow users to edit individual sections of the prompt
2. **Dashboard Item Toggle**: Enable/disable specific analysis components
3. **Custom Dashboard Items**: Add new analysis dimensions
4. **Prompt Versioning**: Track changes to the prompt over time
5. **Preset Prompts**: Switch between different analysis frameworks
