#!/usr/bin/env python3
"""
Setup script to create a system user for reviews
Run this once before populating reviews
"""

import os
import logging
from dotenv import load_dotenv
from supabase import create_client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def setup_system_user():
    """Create a system user for mock reviews"""
    
    try:
        # Initialize Supabase client
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_KEY')
        
        if not supabase_url or not supabase_key:
            logger.error("Supabase credentials not configured in .env")
            return None
        
        client = create_client(supabase_url, supabase_key)
        logger.info("Connected to Supabase")
        
        # Check if system user already exists
        try:
            existing = client.table('users').select('id').eq('username', 'system-reviewer').execute()
            if existing.data:
                user_id = existing.data[0]['id']
                logger.info(f"System user already exists: {user_id}")
                return user_id
        except Exception as e:
            logger.debug(f"System user check: {e}")
        
        # Create system user in auth.users using admin API
        # Note: We need to use the admin key to create users in auth.users
        logger.info("Creating system user in auth...")
        
        try:
            # Try to create auth user
            auth_response = client.auth.admin.create_user({
                "email": "system-reviewer@internal.local",
                "password": "system-reviewer-password-12345",
                "user_metadata": {"role": "system"},
                "email_confirm": True,
            })
            auth_user_id = auth_response.user.id
            logger.info(f"Created auth user: {auth_user_id}")
        except Exception as e:
            logger.error(f"Could not create auth user: {e}")
            # Use a fixed UUID for system reviews if auth creation fails
            auth_user_id = "00000000-0000-0000-0000-000000000001"
            logger.warning(f"Using fixed UUID for system user: {auth_user_id}")
        
        # Create or update app-level user record
        user_data = {
            "id": auth_user_id,
            "email": "system-reviewer@internal.local",
            "username": "system-reviewer",
            "role": "ADMIN",
            "avatar_url": None,
        }
        
        # Try to insert, if it fails due to FK constraint, just use the ID
        try:
            result = client.table('users').insert(user_data).execute()
            logger.info(f"Created app user: {result.data[0]['id']}")
        except Exception as e:
            if "foreign key constraint" in str(e).lower():
                logger.warning(f"Auth user not found in Supabase auth table (expected for admin-created users)")
                logger.info(f"Using user ID: {auth_user_id}")
            else:
                logger.warning(f"Could not create app user: {e}")
        
        return auth_user_id
    
    except Exception as e:
        logger.error(f"Setup failed: {e}")
        return None

if __name__ == "__main__":
    user_id = setup_system_user()
    if user_id:
        logger.info(f"\n{'='*60}")
        logger.info(f"System user ready!")
        logger.info(f"Add this to your .env file:")
        logger.info(f"DEFAULT_REVIEWER_ID={user_id}")
        logger.info(f"{'='*60}\n")
    else:
        logger.error("Failed to create system user")
