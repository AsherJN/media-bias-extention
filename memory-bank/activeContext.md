# Active Context: Media Bias Analyzer

## Current Work Focus

The Media Bias Analyzer is currently at version 2.0, with a focus on the following areas:

1. **Side Panel Implementation**: The extension now uses Chrome's side panel API instead of a traditional popup, providing more screen real estate for displaying comprehensive analysis results.

2. **History Feature**: A history tracking system has been implemented to allow users to revisit previously analyzed articles.

3. **Settings Framework**: Basic settings infrastructure is in place, though specific configuration options are still being developed.

4. **UI Refinement**: The interface has been designed with a clean, modern aesthetic using a blue color scheme and expandable content sections.

5. **JSON-Based Prompt Framework**: The AI prompt has been restructured into a modular JSON format to improve maintainability and enable future customization features.

## Recent Changes

### Documentation Updates
- Completely overhauled README.md to reflect current version 2.0 status and features
- Added mermaid diagram to README.md to visualize system architecture
- Updated installation and usage instructions for side panel implementation
- Added comprehensive sections on features, architecture, and roadmap
- Included troubleshooting guide and current status information

### UI/UX Improvements
- Implemented a bias meter with visual indicator showing the article's position on the political spectrum
- Added collapsible sections for different analysis components to prevent information overload
- Designed a history page with entry management functionality
- Created a settings page framework for future configuration options
- Removed the section-based prompt editing UI and Advanced Settings page
- Implemented a comprehensive AI Bias Prompt editor in the "View AI Bias Prompt" page:
  - Separated into Personality and Dashboard Items sections
  - Allows editing of content for Personality items
  - Allows editing of both title and content for Dashboard Items
  - Each card has a save button with success feedback
  - Added a Reset to Default button at the top of the page
  - Hidden prompt_instructions section from user editing
- Added task progress updates: fading text prompts at key analysis milestones alongside loading spinner
- Fixed spacing between header div and bias score div for a consistent, polished layout

### Technical Enhancements
- Migrated to Chrome Extension Manifest V3
- Implemented side panel integration using Chrome's side panel API
- Added favicon extraction for history entries
- Improved error handling for network and API issues
- Implemented client-side prompt storage and retrieval using Chrome storage (background.js, popup.js)
- Modified backend analyze endpoint to accept and use a provided prompt parameter (media-bias-backend/app.py)
- Converted the AI bias prompt from a string to a structured JSON format (promptFramework.json)
- Created utility functions for working with the JSON prompt framework (promptUtils.js)
- Removed all JavaScript functions related to section-based prompt editing
- Improved asynchronous handling in the analyze button click handler
- Restructured promptFramework.json to use a categorized approach with three main groups:
  - Personality (role, context)
  - Dashboard Items (all dashboard_item_* sections)
  - Prompt Instructions (article_text, task, json_schema)
- Enhanced promptUtils.js with functions to support the categorized JSON structure:
  - Added flattenSections() to convert nested structure to flat array
  - Added findSectionById() to locate sections in the nested structure
  - Added getSectionsByCategory() to get sections from a specific category
- Implemented dynamic text bubble creation in popup.js:
  - Added createDynamicTextBubbles() function that dynamically creates text bubbles based on dashboard items in the analysis response
  - Function reads promptFramework.json from Chrome storage to get corresponding titles for each dashboard item
  - Removed hardcoded fallback approaches to ensure technology alignment
  - Makes the UI more maintainable and adaptable to changes in the backend response structure

### Backend Refinements
- Updated the OpenAI integration to use GPT-4o
- Refined the analysis prompt to provide more nuanced bias evaluation
- Implemented JSON response formatting for consistent data structure
- Pinned OpenAI package to version 0.28.1 to resolve import compatibility issues
- Removed backend generate_prompt() function and now require prompt sent from frontend
- Updated analyze endpoint to remove fallback generate_prompt and enforce provided prompt usage

### Standardization Improvements
- Removed all backward compatibility code from the codebase
- Removed map_json_fields() function from app.py that was mapping new JSON field names to old ones
- Updated the analyze endpoint to return raw JSON without field mapping
- Refactored promptUtils.js to only work with the standardized nested JSON structure
- Removed conditional checks for old flat structure in all utility functions
- Updated background.js to no longer store full prompt string for backward compatibility
- Modified popup.js to remove fallback to legacy prompt approach
- Updated displayResults() function to use only standardized dashboard_item_X field names
- Simplified code throughout the application by standardizing on a single JSON structure
- Fixed naming inconsistency in popup.js where dashboard_item_1 and dashboard_item_2 were not being properly displayed on the frontend
  - Updated displayResults() function to use dashboard_item_1 instead of bias_score for the bias meter
  - Updated displayResults() function to use dashboard_item_2 instead of analysis_summary for the summary section
  - Added a text bubble for dashboard_item_1 (Overall Bias Score) in the results section
  - Updated saveToHistory() function to use dashboard_item_1 instead of bias_score when saving to history

## Next Steps

### Short-term Priorities
1. **Improve Text Extraction**: Enhance the article content extraction logic to better handle various website structures
2. **Expand Settings Options**: Implement user-configurable settings such as:
   - Default analysis depth
   - UI theme preferences
   - History retention period
3. **Add Export Functionality**: Allow users to export analysis results or history
4. **Advanced Prompt Features**: Add ability to create, save, and manage multiple prompt templates

### Medium-term Goals
1. **Deploy Backend Server**: Move from local-only backend to a hosted solution
2. **Implement User Accounts**: Optional accounts for syncing history across devices
3. **Add Sentiment Analysis**: Expand analysis to include sentiment metrics
4. **Dashboard Customization**: Allow users to add, remove, or reorder dashboard items using the JSON framework

### Long-term Vision
1. **Historical Data Tracking**: Track bias patterns across publications over time
2. **Recommendation Engine**: Suggest alternative sources based on analysis
3. **Browser Support**: Expand beyond Chrome to other browsers
4. **Prompt Template Library**: Create a library of prompt templates for different types of analysis

## Active Decisions and Considerations

### Technical Decisions
- **Local vs. Hosted Backend**: Currently using a local backend for development, but considering options for deployment
- **Data Storage Strategy**: Evaluating the balance between local storage and potential cloud storage for user data
- **API Usage Optimization**: Looking for ways to minimize token usage while maintaining analysis quality
- **JSON Schema Evolution**: Planning for how to handle schema changes in the prompt framework as new features are added

### UX Decisions
- **Information Density**: Balancing comprehensive analysis with an uncluttered interface
- **Visual Indicators**: Considering how to represent bias and other metrics in an intuitive way
- **Accessibility**: Ensuring the extension is usable by people with various abilities
- **Prompt Customization Interface**: Designing an intuitive interface for editing prompt sections

### Product Decisions
- **Monetization Strategy**: Evaluating options for sustainable development (API costs vs. user pricing)
- **Feature Prioritization**: Determining which enhancements provide the most user value
- **Marketing Approach**: Considering how to position the tool in the media literacy space
- **Customization vs. Simplicity**: Finding the right balance between powerful customization options and ease of use

## Important Patterns and Preferences

### Code Organization
- **Separation of Concerns**: Keeping content extraction, analysis, and UI rendering logic separate
- **Event-Driven Architecture**: Using event listeners for user interactions
- **Asynchronous Operations**: Handling API calls and UI updates asynchronously
- **Modular Data Structures**: Using structured JSON for configuration and customization
- **Standardized Approach**: Using consistent field naming and data structures throughout the codebase

### UI Design Principles
- **Clean, Modern Aesthetic**: Using a blue-based color scheme with ample white space
- **Progressive Disclosure**: Showing summary information first, with details available on demand
- **Consistent Visual Language**: Using similar styling for related components
- **Customization Affordances**: Making customizable elements clearly identifiable

### Development Workflow
- **Feature-Based Development**: Implementing one complete feature at a time
- **Iterative Testing**: Testing each component with various news articles
- **Documentation-Driven**: Maintaining comprehensive documentation alongside code
- **Schema-First Design**: Defining data structures before implementing functionality

## Learnings and Project Insights

### Technical Insights
- Chrome's side panel API provides a better user experience for content-heavy extensions
- Text extraction from news sites requires balancing simplicity with effectiveness
- Managing API costs is a significant consideration for AI-powered tools
- Structured JSON provides a more maintainable way to manage complex prompts
- Standardizing on a single data structure simplifies code and improves maintainability

### User Experience Insights
- Users prefer clear, visual representations of bias rather than just numerical scores
- Providing context and alternative perspectives is highly valued by users
- History functionality helps users track their media consumption patterns
- Customization options need to be balanced with simplicity to avoid overwhelming users

### Project Management Insights
- Balancing feature development with technical debt management is crucial
- Clear documentation helps maintain momentum across development sessions
- Testing with diverse news sources reveals edge cases in content extraction and analysis
- Refactoring core components (like the prompt system) requires careful planning to avoid regressions
