
import sys

if __name__ == "__main__":
    try:
        code = sys.stdin.read()  # Read full Python code from stdin (multi-line support)
        exec(code, globals())  # Execute the Python code in a global scope
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)  # Print errors to stderr
