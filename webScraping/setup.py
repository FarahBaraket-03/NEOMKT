"""
Installation and setup script
"""

import os
import subprocess
import sys
from pathlib import Path


def run_command(cmd, description):
    """Run a shell command"""
    print(f"\n{'='*60}")
    print(f"▶ {description}")
    print(f"{'='*60}")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=False)
        return result.returncode == 0
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def main():
    """Setup script"""
    
    print("""
    ╔═══════════════════════════════════════════════════════════════╗
    ║         WEB SCRAPER SETUP & CONFIGURATION                     ║
    ║     Safe Tech Products Data Fetching Installation              ║
    ╚═══════════════════════════════════════════════════════════════╝
    """)

    # Get Python version
    print(f"Python version: {sys.version}")
    
    # Check if we're in the right directory
    if not os.path.exists('requirements.txt'):
        print("\n✗ Error: requirements.txt not found!")
        print("Please run this script from the webScraping directory")
        sys.exit(1)

    # Step 1: Create virtual environment (optional)
    create_venv = input("\nCreate virtual environment? (y/n): ").strip().lower() == 'y'
    
    if create_venv:
        if sys.platform == 'win32':
            run_command("python -m venv venv", "Creating virtual environment on Windows")
            print("\n✓ To activate: .\\venv\\Scripts\\activate")
        else:
            run_command("python -m venv venv", "Creating virtual environment on Unix/Mac")
            print("\n✓ To activate: source venv/bin/activate")
    
    # Step 2: Install dependencies
    if run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        print("✓ Dependencies installed")
    else:
        print("✗ Failed to install dependencies")
        sys.exit(1)

    # Step 3: Setup environment
    if not os.path.exists('.env'):
        print("\n" + "="*60)
        print("▶ Setting up .env configuration")
        print("="*60)
        try:
            with open('.env.example', 'r') as f:
                example = f.read()
            with open('.env', 'w') as f:
                f.write(example)
            print("✓ Created .env file (copy of .env.example)")
            print("⚠ Please edit .env with your Supabase credentials")
        except Exception as e:
            print(f"✗ Error creating .env: {e}")
    else:
        print("\n✓ .env file already exists")

    # Step 4: Create logs directory
    logs_dir = Path('logs')
    logs_dir.mkdir(exist_ok=True)
    print(f"\n✓ Created logs directory: {logs_dir}")

    # Step 5: Run tests
    run_tests = input("\nRun tests? (y/n): ").strip().lower() == 'y'
    if run_tests:
        run_command("python -m pytest test_scraper.py -v", "Running unit tests")

    # Final instructions
    print("""
    
    ╔═══════════════════════════════════════════════════════════════╗
    ║                    SETUP COMPLETE! ✓                          ║
    ╚═══════════════════════════════════════════════════════════════╝
    
    Next Steps:
    
    1️⃣  CONFIGURE
        Edit .env with your Supabase credentials:
        - SUPABASE_URL: https://your-project.supabase.co
        - SUPABASE_KEY: your-anon-key
    
    2️⃣  TEST
        Run examples to understand the API:
        $ python examples.py
    
    3️⃣  RUN SCRAPER
        Start fetching tech products:
        $ python run.py
    
    4️⃣  CHECK RESULTS
        - Logs: tail -f logs/scraper.log
        - Database: Check Supabase dashboard
    
    📚 Documentation: Read README.md for detailed information
    
    Need help?
    - Check logs/scraper.log for detailed error messages
    - Review examples.py for usage patterns
    - See README.md for troubleshooting
    """)


if __name__ == '__main__':
    main()
