import { css } from "lit";

export const defaultStyles = css`
    a {
        color: inherit;
        text-decoration: none;
        color: var(--black);
    }

    .trip-detail-container {
        margin-top: 1rem;
    }

    .trip-detail-notfound {
        padding: 0 2rem;
    }

    .trip-detail-container-title {
        color: var(--green);
        font-size: 1.4rem;
        padding: 0 1rem;
    }
`;

export const defaultButtonStyles = css`
    .primary__button,
    .secondary__button {
        padding: 10px;
        border-radius: 5px;
        font-family: var(--font-sans);
        text-transform: uppercase;
        cursor: pointer;
    }
    .primary__button {
        color: white;
        margin: 1rem 0;
        background-color: var(--primary);
        border: 1px solid var(--primary);
    }
    .primary__button:hover {
        background-color: var(--green);
    }
    .secondary__button {
        margin: 20px;
        background-color: var(--white);
        border: 1px solid var(--black);
    }

    .secondary__button:hover {
        background-color: var(--secondary);
    }

    .title-and-link {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
        padding: 1rem;
    }
`;

export const formStyles = css`
    .form-control__input,
    .form-control__button {
        padding: 10px;
        margin: 5px;
        border-radius: 5px;
        border: 1px solid var(--black);
        width: 100%;
        box-sizing: border-box;
    }

    .form-control__button {
        background-color: var(--green);
        color: var(--white);
        cursor: pointer;
        text-transform: uppercase;
        font-size: 18px;
    }
    .form-control__button:hover {
        background-color: var(--primary);
    }
`;
