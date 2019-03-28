import React from "react";
import { Link } from "react-router-dom";
// reactstrap components
import {
  Button,
  Collapse,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
  Row,
  Col
} from "reactstrap";
//---------------------------------------------------------------------------
import {
  FormControl,
  InputGroup,
  NavDropdown,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";

// import "src/assets/css/blk-design-system-react.min.css";
import { Field, Form, Formik } from "formik";
import Cookie from "js-cookie";
import { Router } from "next-router";
import { useState } from "react";
import { useApolloClient, useMutation } from "react-apollo-hooks";
// import useMe from "useMe";
// import useSteemKeychain from "useSteemKeychain";
//import { VERIFY_LOGIN_MUTATION } from "mutations";

// --------------------------
import gql from "graphql-tag";

export const VERIFY_LOGIN_MUTATION = gql`
  mutation verifyLogin($username: String!) {
    verifyLogin(username: $username)
  }
`;
// --------------------------


const useMe = require("./useMe.js");
const useSteemKeychain = require("./useSteemKeychain.js");
//const mutations = require("./mutations.js")
//let val = VERIFY_LOGIN_MUTATION();

function LoginForm({ refetchMe }) {
  const {
    steemKeychain,
    loaded: steemKeychainLoaded,
    checkForKeychain,
  } = useSteemKeychain();

  // If steem keychain not found, check for it unless already checked

  if (!steemKeychain) {
    if (steemKeychainLoaded) {
      // prettier-ignore
      return <p>Please install <Link href="https://github.com/MattyIce/steem-keychain"><a>Steem Keychain</a></Link> to login</p>;
    } else {
      return checkForKeychain();
    }
  }

  const verifyLogin = useMutation(VERIFY_LOGIN_MUTATION);

  async function Login(username) {
    let encryptedToken;

    // verifyLogin returns a jwt encrypted with user's public memo key

    const res = await verifyLogin({ variables: { username } });
    encryptedToken = res.data.verifyLogin;

    // If user can decode jwt then set cookie to that token

    return new Promise((resolve, reject) => {
      steemKeychain.requestVerifyKey(username, encryptedToken, "Memo", res => {
        if (res.success) {
          Cookie.set("accessToken", res.result.split("#")[1]);
          // refetch me query, now logged in
          refetchMe();
          resolve();
        } else {
          reject();
        }
      });
    });
  }

  return (
    <Formik
      initialValues={{
        username: "",
      }}
      onSubmit={async (values, { setErrors, setSubmitting }) => {
        try {
          await Login(values.username);
        } catch {
          setErrors({
            username: "Sorry, something went wrong",
          });
          setSubmitting(false);
        }
      }}
      render={({ errors, isSubmitting }) => (
        <Form>
          <InputGroup className="mb-3">
            <InputGroup.Prepend>
              <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
              placeholder="Username"
              aria-label="Username"
              aria-describedby="basic-addon1"
              name="username"
              id="username"
              as={Field}
              autoFocus
            />
          </InputGroup>
          <p>{errors.username || null}</p>
          <Button
            disabled={isSubmitting}
            type="submit"
            variant="outline-primary"
          >
            {isSubmitting ? "Verifying" : "Login"}
          </Button>
        </Form>
      )}
    />
  );
}

function Header() {
  const { me, refetchMe } = useMe();
  const client = useApolloClient();
  const [appear, setAppear] = useState(false);

  function Logout() {
    Cookie.remove("accessToken");
    client.resetStore();
  }

  const AuthNav = () => {
    if (me) {
      const { name } = me;
      return (
        <>
          <NavDropdown title={name}>
            <NavDropdown.Item onClick={() => Logout()}>Logout</NavDropdown.Item>
          </NavDropdown>
        </>
      );
    } else {
      return (
        <OverlayTrigger
          trigger="click"
          placement="left"
          overlay={
            <Popover title={`Enter your Steem username`}>
              <LoginForm refetchMe={refetchMe} />
            </Popover>
          }
        >
          <Nav.Link>Login</Nav.Link>
        </OverlayTrigger>
      );
    }
  };

  return (
    <Navbar bg="light" expand="md">
      <Container>
        <Link passHref href="/">
          <Navbar.Brand>LiveSteem</Navbar.Brand>
        </Link>
        <Navbar.Toggle onClick={() => setAppear(!appear)} />
        <Navbar.Collapse appear={appear}>
          <Nav className="ml-auto">
            <AuthNav />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

// export default Router(Header);
// -----------------------------------------------------
class ComponentsNavbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseOpen: false,
      color: "navbar-transparent"
    };
  }
  componentDidMount() {
    window.addEventListener("scroll", this.changeColor);
  }
  componentWillUnmount() {
    window.removeEventListener("scroll", this.changeColor);
  }
  changeColor = () => {
    if (
      document.documentElement.scrollTop > 99 ||
      document.body.scrollTop > 99
    ) {
      this.setState({
        color: "bg-success"
      });
    } else if (
      document.documentElement.scrollTop < 100 ||
      document.body.scrollTop < 100
    ) {
      this.setState({
        color: "navbar-transparent"
      });
    }
  };
  toggleCollapse = () => {
    document.documentElement.classList.toggle("nav-open");
    this.setState({
      collapseOpen: !this.state.collapseOpen
    });
  };
  onCollapseExiting = () => {
    this.setState({
      collapseOut: "collapsing-out"
    });
  };
  onCollapseExited = () => {
    this.setState({
      collapseOut: ""
    });
  };
  scrollToDownload = () => {
    document
      .getElementById("download-section")
      .scrollIntoView({ behavior: "smooth" });
  };
  render() {
    return (
      <Navbar
        className={"fixed-top " + this.state.color}
        color-on-scroll="100"
        expand="lg"
      >
        <Container>
          <div className="navbar-translate">
            <NavbarBrand
              data-placement="bottom"
              to="/"
              rel="noopener noreferrer"
              title="The official home of Hashkings"
              tag={Link}
            >
              <span>Steem• </span>
              <span>HashKings</span>
            </NavbarBrand>
            <button
              aria-expanded={this.state.collapseOpen}
              className="navbar-toggler navbar-toggler"
              onClick={this.toggleCollapse}
            >
              <span className="navbar-toggler-bar bar1" />
              <span className="navbar-toggler-bar bar2" />
              <span className="navbar-toggler-bar bar3" />
            </button>
          </div>
          <Collapse
            className={"justify-content-end " + this.state.collapseOut}
            navbar
            isOpen={this.state.collapseOpen}
            onExiting={this.onCollapseExiting}
            onExited={this.onCollapseExited}
          >
            <div className="navbar-collapse-header">
              <Row>
                <Col className="collapse-brand" xs="6">
                  <a href="#pablo" onClick={e => e.preventDefault()}>
                    Steem•Hashkings
                  </a>
                </Col>
                <Col className="collapse-close text-right" xs="6">
                  <button
                    aria-expanded={this.state.collapseOpen}
                    className="navbar-toggler"
                    onClick={this.toggleCollapse}
                  >
                    <i className="tim-icons icon-simple-remove" />
                  </button>
                </Col>
              </Row>
            </div>
            <Nav navbar>
              <NavItem className="p-0">
                <NavLink
                  data-placement="bottom"
                  href="https://twitter.com/canna_curate"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Follow us on Twitter"
                >
                  <i className="fab fa-twitter" />
                  <p className="d-lg-none d-xl-none">Twitter</p>
                </NavLink>
              </NavItem>
              <NavItem className="p-0">
                <NavLink
                  data-placement="bottom"
                  href="https://www.facebook.com/canna-curate"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Like us on Facebook"
                >
                  <i className="fab fa-facebook-square" />
                  <p className="d-lg-none d-xl-none">Facebook</p>
                </NavLink>
              </NavItem>
              <NavItem className="p-0">
                <NavLink
                  data-placement="bottom"
                  href="https://www.instagram.com/canna.curate"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Follow us on Instagram"
                >
                  <i className="fab fa-instagram" />
                  <p className="d-lg-none d-xl-none">Instagram</p>
                </NavLink>
              </NavItem> 
              <NavItem>
                <NavLink tag={Link} to="/login">
                  Login
                </NavLink>
              </NavItem>				
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    );
  }
}

export default ComponentsNavbar;