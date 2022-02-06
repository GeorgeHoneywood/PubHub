import {Container, Nav, Navbar} from "react-bootstrap";
import logo from "../../logo.svg";
import {PubList} from "../pub-list/PubList";
import styles from './TopBar.module.css';

export function TopBar(props: any) {
    return (
        <Navbar bg="dark" variant="dark">
            <Container fluid>
                <Navbar.Brand href="#home">
                    <img
                        alt=""
                        src={logo}
                        width="30"
                        height="30"
                        className="d-inline-block align-top me-2"
                    />
                    PubHub
                </Navbar.Brand>
                <Nav>
                    <h6 className={styles.topText}>Zoom in on London to start seeing pub crawl paths</h6>
                </Nav>
                <Nav>
                    <PubList className="d-flex"/>
                </Nav>
                {/*<Nav className="me-auto">*/}
                {/*    <Nav.Link href="#home">Home</Nav.Link>*/}
                {/*    <Nav.Link href="#features">Features</Nav.Link>*/}
                {/*    <Nav.Link href="#pricing">Pricing</Nav.Link>*/}
                {/*</Nav>*/}
            </Container>
        </Navbar>
    )
}