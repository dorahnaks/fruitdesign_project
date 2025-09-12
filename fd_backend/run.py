from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
# This file is the entry point for running the Flask application.
# It imports the create_app function from the app module, creates an instance of the Flask application, and runs it in debug mode.
# The application can be started by running this script directly.