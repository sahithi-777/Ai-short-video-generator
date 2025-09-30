'use client'
import React, { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Users } from '@/configs/schema';
import { db } from '@/configs/db';
import { eq } from 'drizzle-orm';

const Provider = ({ children }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      checkOrCreateUser();
    }
  }, [isLoaded, isSignedIn, user]);
  
  const checkOrCreateUser = async () => {
    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      
      if (!userEmail) {
        console.error('No email found for user');
        return;
      }
      
      // Check if user already exists
      const existingUsers = await db
        .select()
        .from(Users)
        .where(eq(Users.email, userEmail));
      
      if (existingUsers.length === 0) {
        // Create new user
        const newUserData = {
          name: user.fullName || 'Anonymous User',
          email: userEmail,
          imageUrl: user.imageUrl || null,
          subscription: false
        };
        
        await db.insert(Users).values(newUserData);
        console.log('New user created successfully');
      } else {
        console.log('User already exists');
      }
      
    } catch (error) {
      console.error('Error managing user:', error);
    }
  };
  
  return (
    <div>{children}</div>
  );
};

export default Provider;