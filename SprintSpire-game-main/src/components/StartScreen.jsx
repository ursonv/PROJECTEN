import React, { useState } from "react";

const StartScreen = ({ onStart, lastGameTime, playerName, leaderboard }) => {
  const [nameInput, setNameInput] = useState(playerName);

  const handleNameChange = (e) => {
    setNameInput(e.target.value);
  };

  const handleStartClick = () => {
    if (nameInput.trim()) {
      onStart(nameInput);
    } else {
      alert("Please enter a name to start!");
    }
  };

  return (
    <div style={styles.body}>

      <div style={styles.overlay}></div>

      <div style={styles.container}>

        <div style={styles.sprint}>Sprint<span style={styles.spire}>Spire</span></div>
        
        <input
          type="text"
          value={nameInput}
          onChange={handleNameChange}
          placeholder="Your Name"
          style={styles.input}
        />
        
        <button onClick={handleStartClick} style={styles.button}>
          Play
        </button>
        
        {lastGameTime > 0 && (
          <p style={styles.lastTime}>
            Congrats {playerName ? `${playerName}, ` : ""}! Your last time is: {lastGameTime}s.
          </p>
        )}
        
        <h3 style={styles.leaderboardTitle}>Leaderboard (Top 10)</h3>
        
        <div style={styles.leaderboardContainer}>
          <table style={styles.leaderboardTable}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>Rank</th>
                <th style={styles.tableHeader}>Name</th>
                <th style={styles.tableHeader}>Time (s)</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={index} style={styles.tableRow}>
                  <td style={styles.tableData}>{index + 1}</td>
                  <td style={styles.tableData}>{entry.name}</td>
                  <td style={styles.tableData}>{entry.time}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* References Section */}
        <div style={styles.referencesSection}>
          <h3 style={styles.referencesTitle}>References</h3>
          <ul style={styles.referencesList}>
            <li><a href="https://sketchfab.com/search?q=fall+guys&type=models" target="_blank" style={styles.link}>Obstacle Flipper</a></li>
            <li><a href="https://sketchfab.com/search?q=fall+guys&type=models" target="_blank" style={styles.link}>Character</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  body: {
    display: "flex",
    justifyContent: "center", 
    alignItems: "center",
    height: "100vh",
    backgroundImage: "url('../../background.jpeg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    margin: 0,
    position: "relative",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
    zIndex: 1, 
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "50px",
    borderRadius: "20px",
    width: "80%",
    maxWidth: "600px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    zIndex: 2, 
  },
  sprint: {
    color: "#2fd8de",
    fontSize: "60px",
    fontWeight: "Bold",
    marginBottom: "20px", 
    backgroundColor: "#d2006c",
    borderRadius: "10px", 
    padding: "10px",
  },
  spire: {
    color: "#fff",
    fontSize: "60px",
    fontWeight: "Bold",
    marginBottom: "20px", 
  },
  input: {
    padding: "10px 20px",
    fontSize: "18px",
    borderRadius: "25px",
    border: "2px solid #d2006c",
    width: "30%", 
    marginBottom: "20px",
    outline: "none",
    textAlign: "center",
    transition: "0.3s",
  },
  button: {
    padding: "10px 20px",
    fontSize: "20px",
    backgroundColor: "#d2006c",
    color: "#fff",
    borderRadius: "25px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    transition: "0.3s",
    marginBottom: "20px",
  },
  lastTime: {
    fontSize: "18px",
    color: "#fff",
    marginTop: "20px",
    padding: "5px",
    backgroundColor: "#d2006c",
  },
  leaderboardTitle: {
    fontSize: "28px",
    color: "#fff",
    marginTop: "20px",  
    marginBottom: "10px", 
    fontFamily: "'Baloo Da 2', sans-serif",
    fontWeight: "bold",
    letterSpacing: "1px",
    textTransform: "uppercase",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    
    textShadow: "2px 2px 4px rgba(210, 0, 108, 0.5)", 
  },
  leaderboardContainer: {
    width: "100%",
    marginTop: "-15px",
  },
  leaderboardTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px", 
  },
  tableHeaderRow: {
    backgroundColor: "#d2006c",
    color: "#fff",
    fontSize: "18px",
  },
  tableHeader: {
    padding: "10px",
    textAlign: "center",
  },
  tableRow: {
    backgroundColor: "#fff",
    color: "#333",
    borderBottom: "1px solid #d2006c",
    fontSize: "18px",
  },
  tableData: {
    padding: "10px",
    textAlign: "center",
  },
  referencesSection: {
    marginTop: "30px",
    color: "#fff",
    fontSize: "18px",
    textAlign: "center",
  },
  referencesTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "15px",
  },
  referencesList: {
    listStyle: "none",
    padding: 0,
  },
  link: {
    color: "#d2006c",
    textDecoration: "none",
    fontSize: "18px",
    display: "block",
    marginBottom: "10px",
    transition: "color 0.3s",
  },
};

export default StartScreen;
