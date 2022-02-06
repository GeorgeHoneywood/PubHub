import { Spinner } from 'react-bootstrap';
import styles from './LoadingOverlay.module.css';


export function LoadingOverlay() {
    return (
        <div className={styles.spinnerContainer}>
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    )
}