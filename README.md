
# Study Management System

# Introduction

### Purpose
The Study Management System is a web application designed to help students track and log their study progress across various subjects. It allows students to input the hours studied for a subject on a daily basis and provides estimates of the remaining hours required for each subject, based on user-defined allotments.

## Features

### User Interface
- A clean and simple user interface with input fields for entering:
  - Subject name
  - Hours covered for the day
- A result area displaying:
  - Subject-wise summary of hours spent
  - Hours remaining for each subject
- Clear visual layout to ensure easy navigation and input.

### Study Progress Tracking
- Input:
  - Users will input the number of hours they have studied for a subject on a specific day (e.g., 2 hours).
- **Calculation:**
  - Based on the remaining percentage (Total Hours - Covered Hours), the system calculates and displays the percentage of time left for each subject within a given week or month.

### Data Storage
- Use **LocalStorage** or **Session Storage** to save:
  - Study progress data
  - User inputs
- Ensures that users can revisit and track their progress without losing previously entered information.

### Input Validation
- Validate user inputs to ensure:
  - Hours covered are within the range of 0 and 24.
  - Study hours are positive numeric values.
- Display appropriate error messages for invalid inputs, such as:
  - Non-numeric values
  - Hours outside the valid range

### Result Display
- After users input their study data, the system updates the dashboard with real-time results.
  - Displays total hours studied
  - Shows the remaining hours per subject

## Technical Specifications

### **Tech Stack**
- **Frontend:** HTML, CSS, JavaScript
- **Logic Implementation:** DOM Manipulation for capturing user input and calculating remaining study hours
- **Storage:** LocalStorage or Session Storage for persisting study progress data

### Deployment
- Deployment Platform:
  - [Netlify]((https://studyms.netlify.app/))

## Installation

Follow these steps to set up the project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/study-management-system.git
   ```
2. Navigate to the project directory:
   ```bash
   cd study-management-system
   ```
3. Open the `index.html` file in your preferred browser to start using the application.
