import {Button, FormLabel, ListGroup, Offcanvas} from "react-bootstrap";
import {useContext, useState} from "react";
import {CurrentCrawl} from "../../contexts/CurrentCrawl";
import styles from './PubList.module.css'
import FormRange from "react-bootstrap/FormRange";
import {MaxPubs} from "../../contexts/MaxPubs";

export function PubList(props: any) {
    const {currentCrawl} = useContext(CurrentCrawl);
    const {maxPubs, setMaxPubs} = useContext(MaxPubs);
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <div className={styles.listContainer}>
                <Button variant="primary" onClick={handleShow} className="me-2">
                    Itinerary
                </Button>
            </div>
            <Offcanvas show={show} onHide={handleClose} placement={window.innerWidth <= 600 ? 'bottom' : 'start'} className={styles.tallOffcanvas}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Itinerary</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <FormLabel>Maximum No. of Pubs/Bars: {maxPubs}</FormLabel>
                    <FormRange value={maxPubs} onChange={(e) => setMaxPubs(parseInt(e.target.value))} min={4} max={50} />
                    <p>{currentCrawl.pubs.length} pubs - {currentCrawl.distance.toFixed(2)} km - takes {(currentCrawl.time + (10 * currentCrawl.pubs.length)).toFixed(0)} mins</p>
                    <ListGroup numbered={true}>
                        {currentCrawl.pubs.map((value, index) => {
                            return <ListGroup.Item>{value.name || `Pub ${index + 1}`}</ListGroup.Item>
                        })}
                    </ListGroup>
                </Offcanvas.Body>
            </Offcanvas>
        </>

    )
}