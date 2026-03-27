import React from 'react';

const NotFoundPage = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>404 Not Found</h1>
      <p style={styles.text}>The page you're looking for doesn't exist.</p>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '50px',
  },
  heading: {
    fontSize: '36px',
    marginBottom: '20px',
  },
  text: {
    fontSize: '18px',
  },
};

export default NotFoundPage;