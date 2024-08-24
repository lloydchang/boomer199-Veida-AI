import React, { useState, useEffect } from 'react';
import { useAuth } from "@clerk/nextjs";

const AddConceptModal = ({ courseName, onClose, onConceptAdded }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    setIsFileSelected(file !== null);
  }, [file]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsUploading(true);

    if (!file) {
      setError('Please select a file to upload');
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('clerk_id', userId);
    formData.append('course_name', courseName);

    try {
      const extractResponse = await fetch('http://localhost:8080/api/extract_text', {
        method: 'POST',
        body: formData,
      });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.error || 'An error occurred while extracting text.');
      }

      const extractedData = await extractResponse.json();

      const requestBody = {
        clerk_id: userId,
        course_name: courseName,
        notes: extractedData.notes,
        flashcards: extractedData.flashcards,
        mc_questions: extractedData.mc_questions,
      };

      const addConceptResponse = await fetch('http://localhost:8080/api/add_course_concept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!addConceptResponse.ok) {
        const errorData = await addConceptResponse.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to addconcept');
      }

      const responseData = await addConceptResponse.json();

      onConceptAdded();
      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error.message || 'An error occurred while addingconcept');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="create-course-overlay">
      <div className="create-course-form">
        <h2>Add to {courseName}</h2>
        <p className="form-description">Our AI will add more flashcards, summary notes, and MCQs to your existingconcept.</p>
        <form onSubmit={handleSubmit}>
          <div className="file-input-wrapper">
            <div className="file-input-button">Upload concept File (PDF, PNG, JPG, TXT)</div>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              required
              disabled={isUploading}
            />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="form-buttons">
            <button type="submit" disabled={isUploading || !isFileSelected}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
            <button type="button" onClick={onClose} disabled={isUploading}>
              Cancel
            </button>
          </div>
        </form>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default AddConceptModal;
