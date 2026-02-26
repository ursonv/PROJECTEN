import React from 'react';

const Content = {
    1: (
        <div className="popup-content">
            <h1>About</h1>
            <p>Welcome to my tropical island! I'm Urson Vermeersch, a passionate full stack developer with a strong interest in both front-end and back-end technologies. I'm currently completing my bachelor's degree in New Media Development at Arteveldehogeschool, eager to set sail on new professional adventures.</p>
        </div>
    ),
    2: (
        <div className="popup-content">
            <h1>Hobbies</h1>
            <p>Try casting your fishing line and see what you catch! Outside of coding, I enjoy playing darts, watching football with friends, and working on creative design projects using software like Adobe Illustrator and Photoshop.</p>
        </div>
    ),
    3: (
        <div className="popup-content">
            <h1>Work</h1>
            <p>Drop a coin into the wishing well and discover my treasure chest of projects on GitHub. Explore the gems I've crafted and let me know what you think!</p>
        </div>
    ),
    4: (
        <div className="popup-content">
            <h1>Contact</h1>
            <p>Ahoy, sailor! Want to explore more of me? Hop aboard my boat and feel free to contact me or check out my GitHub for further projects!</p>
        </div>
    ),
}

const Popup = ({ currentStage }) => {
    return (
        <div className="popup-container">
            {Content[currentStage] || <p>Invalid stage selected.</p>}
        </div>
    );
}

export default Popup;
