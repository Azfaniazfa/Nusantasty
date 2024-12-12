import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase/firebase';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        const response = await axios.get(
          `http://localhost:3000/profile/${user.uid}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setProfile(response.data);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {profile ? (
        <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
          <p className="mb-4">Name: {profile.name}</p>
          <img
            src={profile.photo_url}
            alt="Profile"
            className="w-24 h-24 rounded-full mb-4"
          />
          <Link to="/editprofile" className="text-blue-500">
            <button className="bg-blue-500 text-white hover:bg-blue-700 p-2 rounded w-full">
              Edit Profile
            </button>
          </Link>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default Profile;
