import {ListGroup} from "react-bootstrap";
import {useContext} from "react";
import {CurrentCrawl} from "../../contexts/CurrentCrawl";
import styles from './PubList.module.css'

export function PubList() {
    const {currentCrawl} = useContext(CurrentCrawl);

    return (
        <div className={styles.listContainer}>
            <ListGroup numbered={true}>
                {currentCrawl.pubs.map((value, index) => {
                    return <ListGroup.Item>{value.name || `Pub ${index + 1}`}</ListGroup.Item>
                })}
            </ListGroup>
        </div>

    )
}