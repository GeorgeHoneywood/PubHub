import {Button, ListGroup, Offcanvas} from "react-bootstrap";
import {useContext, useState} from "react";
import {CurrentCrawl} from "../../contexts/CurrentCrawl";
import styles from './PubList.module.css'

export function PubList(props: any) {
    const {currentCrawl} = useContext(CurrentCrawl);
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <div className={styles.listContainer}>
                <Button variant="primary" onClick={handleShow} className="me-2">
                    Pub/Bar List
                </Button>
            </div>
            <Offcanvas show={show} onHide={handleClose} placement={window.innerWidth <= 600 ? 'bottom' : 'start'}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Pub/Bar List</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
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