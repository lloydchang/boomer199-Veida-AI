"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Markdown from 'markdown-to-jsx';
import { useParams } from 'next/navigation';
import { unformatURL } from '@/app/helpers';
import './notes.css';

// this file has been reworked to get notes by first fetching the whole course object
// and assumes that note is a single string instead of an array of strings

//const NotesPage = ({ courseName }) => {
const NotesPage = () => {
  const { userId } = useAuth();
  // const [notes, setNotes] = useState([]);
  const [notes, setNotes] = useState(null);
  const [error, setError] = useState('');

  const params = useParams();
  const urlCourseName = params['course-name'];
  const courseName = unformatURL(urlCourseName);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`https://veida-ai-backend-production.up.railway.app/api/get_courses?clerk_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // console.log("Fetch successful. Response: ", data);
        //comparison might have to be rewritten in case url en/decoding goes awry
        let courseIndex = data.courses.findIndex( course => courseName.localeCompare(course.course_name) == 0);
        let courseObj = data.courses[courseIndex];
        // console.log('Course: ', courseObj);
        // console.log('Course notes: ', courseObj.notes);
        setNotes(courseObj.notes);
      } else {
        setError('Failed to fetch notes');
      }
    } catch (err) {
      setError('An error occurred while fetching notes');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotes();
    }
  }, [userId, fetchNotes]);

  return (
    <div className="main-inline">
      <div className="container">
        <h1 className="title">Your Notes for {courseName}</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div id="notes-content" style={{fontFamily: "'Poppins', sans-serif", padding: '2em', margin: '1em 3em', borderTop: '1px solid gray'}}>
          {/* {notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.id} className="note">
                <h3>{note.title}</h3>
                <p>{note.content}</p>
              </div>
            )) */}
          { notes ? (
              <div id='markdown'>
                <Markdown>{notes}</Markdown>
                {/* <p style={{whiteSpace: 'pre-wrap'}}>{notes}</p> */}
              </div>
          ) : (
            <p id="unavailable">No notes available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPage;