# Active Context: Media Bias Analyzer

## Current Work Focus

The Media Bias Analyzer is currently at version 2.0, with a focus on the following areas:

1. **Side Panel Implementation**: The extension now uses Chrome's side panel API instead of a traditional popup, providing more screen real estate for displaying comprehensive analysis results.

2. **History Feature**: A history tracking system has been implemented to allow users to revisit previously analyzed articles.

3. **Settings Framework**: Basic settings infrastructure is in place, though specific configuration options are still being developed.

4. **UI Refinement**: The interface has been designed with a clean, modern aesthetic using a blue color scheme and expandable content sections.

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
- Added Advanced Settings page to prompt view for full concatenated prompt editing
- Added task progress updates: fading text prompts at key analysis milestones alongside loading spinner
- Fixed spacing between header div and bias score div for a consistent, polished layout
- Added field-level editing UI for AI bias prompt dashboard items: collapsible sections with individual field editing (Title, Word Count, Definition, Assessment rules, Key Questions) and live save/reset via Chrome storage

### Technical Enhancements
- Migrated to Chrome Extension Manifest V3
- Implemented side panel integration using Chrome's side panel API
- Added favicon extraction for history entries
- Improved error handling for network and API issues
- Implemented client-side prompt storage and retrieval using Chrome storage (background.js, popup.js)
- Modified backend analyze endpoint to accept and use a provided prompt parameter (media-bias-backend/app.py)

### Backend Refinements
- Updated the OpenAI integration to use GPT-4o
- Refined the analysis prompt to provide more nuanced bias evaluation
- Implemented JSON response formatting for consistent data structure
- Pinned OpenAI package to version 0.28.1 to resolve import compatibility issues
- Removed backend generate_prompt() function and now require prompt sent from frontend
- Added map_json_fields() to map new dashboard item fields for backward compatibility
- Updated analyze endpoint to remove fallback generate_prompt and enforce provided prompt usage

## Next Steps

### Short-term Priorities
1. **Improve Text Extraction**: Enhance the article content extraction logic to better handle various website structures
2. **Expand Settings Options**: Implement user-configurable settings such as:
   - Default analysis depth
   - UI theme preferences
   - History retention period
3. **Add Export Functionality**: Allow users to export analysis results or history

### Medium-term Goals
1. **Deploy Backend Server**: Move from local-only backend to a hosted solution
2. **Implement User Accounts**: Optional accounts for syncing history across devices
3. **Add Sentiment Analysis**: Expand analysis to include sentiment metrics

### Long-term Vision
1. **Historical Data Tracking**: Track bias patterns across publications over time
2. **Recommendation Engine**: Suggest alternative sources based on analysis
3. **Browser Support**: Expand beyond Chrome to other browsers

## Active Decisions and Considerations

### Technical Decisions
- **Local vs. Hosted Backend**: Currently using a local backend for development, but considering options for deployment
- **Data Storage Strategy**: Evaluating the balance between local storage and potential cloud storage for user data
- **API Usage Optimization**: Looking for ways to minimize token usage while maintaining analysis quality

### UX Decisions
- **Information Density**: Balancing comprehensive analysis with an uncluttered interface
- **Visual Indicators**: Considering how to represent bias and other metrics in an intuitive way
- **Accessibility**: Ensuring the extension is usable by people with various abilities

### Product Decisions
- **Monetization Strategy**: Evaluating options for sustainable development (API costs vs. user pricing)
- **Feature Prioritization**: Determining which enhancements provide the most user value
- **Marketing Approach**: Considering how to position the tool in the media literacy space

## Important Patterns and Preferences

### Code Organization
- **Separation of Concerns**: Keeping content extraction, analysis, and UI rendering logic separate
- **Event-Driven Architecture**: Using event listeners for user interactions
- **Asynchronous Operations**: Handling API calls and UI updates asynchronously

### UI Design Principles
- **Clean, Modern Aesthetic**: Using a blue-based color scheme with ample white space
- **Progressive Disclosure**: Showing summary information first, with details available on demand
- **Consistent Visual Language**: Using similar styling for related components

### Development Workflow
- **Feature-Based Development**: Implementing one complete feature at a time
- **Iterative Testing**: Testing each component with various news articles
- **Documentation-Driven**: Maintaining comprehensive documentation alongside code

## Learnings and Project Insights

### Technical Insights
- Chrome's side panel API provides a better user experience for content-heavy extensions
- Text extraction from news sites requires balancing simplicity with effectiveness
- Managing API costs is a significant consideration for AI-powered tools

### User Experience Insights
- Users prefer clear, visual representations of bias rather than just numerical scores
- Providing context and alternative perspectives is highly valued by users
- History functionality helps users track their media consumption patterns

### Project Management Insights
- Balancing feature development with technical debt management is crucial
- Clear documentation helps maintain momentum across development sessions
- Testing with diverse news sources reveals edge cases in content extraction and analysis
