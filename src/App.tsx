import { useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { assign, createMachine } from "xstate";
import { useMachine } from "@xstate/react";

enum ButterType {
  UNSALTED = "UNSALTED",
  SEMI_SALTED = "SEMI_SALTED",
}

interface Departement {
  numeroDepartement: string;
  numeroRegion: number;
  nom: string;
}

interface ButterContext {
  departements?: Departement[];
  departement?: string;
  butterType?: ButterType;
  error?: string;
}

const DELAY = "500";

type ButterEvent =
  | { type: "submit" }
  | { type: "departementSelected"; departement: string }
  | { type: "informationClosed" }
  | { type: "butterSelected"; butter: ButterType };

const butterMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QCMCuAXdYBOA6ANgPYCGEAlgHZQAiYADsdlgLZgXqwDEEhFYulAG6EA1vzSYcBEuSq0GTMK3awEQwgGNi6MrwDaABgC6ho4lB1CsMjt7mQAD0QBmAOy5Xn5wBY3AVgAaEABPRAAmMIA2XG8DAE4ARlc4yIAOVz8AX0ygiSw8CHpGFjYOABkZSG4ixWV0AGUwfDANLAhTe0trWwp7JwQ-ONwE5zDUhLDAkMRvWNxU7z9UyYS4v2cJrJyQPKld7Ebm1t0KTn3DlraOpBAumxO+xESY1LWDVfXNoNCESNdo9apSIpMZxAyRSbZXIYfK4QTEfBkCCcWCoZDMGzXCxWe52G79CYGXBxZzpMIGVwGDaTb5PAzeYl-SJ+EZ-BLpLbQyR4VHomw6KjcXj8dRiXD7XC8jGYShQNQUYRaHqmLG3HE9R4IOKpXD02J-UljL7TBAJVm4cnjMLa5ZWzk7GFSKX82WcHDYQh4Oj4bQAM09zHFjp5aOlArl6iVJxVxk66oe+JcYXcFPp6zB9LcnlpWriYQtzjSCUi+sh2wl7s9nAcsHQ2n4xF9+QAFM4DO2AJRnYO4SvYVV3DWJhA+BK4dPk5wZ3yeVw5kvODzOPzvPzAvwRZPZbYUQiFeA3fZx7oJ0D9AC0CSJm+ZEKmP3PkShDu50lIsvkxSUpQP2JPeLPGYwhzVJnGfCVCgUEoVAqUhIGPXFemHYFxzibw4kpSlqXvFxIjHQYDHJOIUnifxwJ7c4mkuU81X-JDAIQTwYlcDkMNvGkTSWMc8M8DDUhZNcyy5WF4URCAEKHBiJkXMI228NIMhApJdSWHwSJJDJyNfZ0ZSoCSaP6VIdWtbx2TQz4OJ+Yix1cEY3FecEhJfWEdLafSAMcRAJgZYjmWWKljR+CZrQ8NJUkIksxgiMDyx7Pt3PozyR0iRdlySKlpyzOcTVcbx3DzV4lleKLZO3TIgA */
  createMachine<ButterContext, ButterEvent>(
    {
      context: { butterType: undefined, departement: undefined },
      predictableActionArguments: true,
      initial: "loadingDepartements",
      states: {
        loadingDepartements: {
          invoke: {
            src: "fetchDepartements",
            onDone: [
              {
                target: "departementsLoaded",
                actions: assign({ departements: (ctx, evt) => evt.data }),
              },
            ],
          },
        },
        departementsLoaded: {
          on: {
            departementSelected: {
              target: "butterSelection",
              actions: assign({ departement: (ctx, evt) => evt.departement }),
            },
          },
        },
        butterSelection: {
          on: {
            butterSelected: {
              target: "valid",
              actions: assign({ butterType: (ctx, evt) => evt.butter }),
            },
          },
        },
        valid: {
          on: {
            submit: {
              target: "submitting",
            },
          },
        },
        submitting: {
          invoke: {
            src: "submit",
            onDone: [
              {
                target: "submitted",
              },
            ],
            onError: [
              {
                target: "error",
                actions: assign({ error: (ctx, evt) => evt.data.message }),
              },
            ],
          },
        },
        submitted: {},
        error: {
          after: {
            "3000": {
              target: "#butter.butterSelection",
              actions: [],
              internal: false,
            },
          },
        },
      },
      id: "butter",
    },
    {
      services: {
        fetchDepartements: () =>
          fetch("/api/departements", {
            headers: {
              "x-delay": DELAY,
            },
          })
            .then((resp) => resp.json())
            .then((dpts) =>
              dpts.sort(
                (d1: Departement, d2: Departement) =>
                  d1.numeroDepartement > d2.numeroDepartement
              )
            ),
        submit: (context) => {
          return fetch("/api/answers", {
            method: "POST",
            body: JSON.stringify({
              departement: context.departement,
              butter: context.butterType,
            }),
            headers: {
              "Content-Type": "application/json",
              "x-delay": DELAY,
            },
          }).then((response) => {
            if (response.status >= 400) {
              return response.json().then((err) => {
                throw new Error(err.message);
              });
            } else {
              return {};
            }
          });
        },
      },
      guards: {},
    }
  );

function App() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [{ context, value, matches }, send, service] =
    useMachine(butterMachine);

  service.subscribe((state) => {
    if (
      state.matches("butterSelection.information.displayed") &&
      !dialogRef.current?.open
    ) {
      dialogRef.current?.showModal();
    }
  });

  console.log("context", context);
  console.log(JSON.stringify(value));
  if (matches("submitted")) {
    return <div>Thank you !</div>;
  } else if (matches("loadingDepartements")) {
    return <Loader />;
  }

  return (
    <>
      <dialog ref={dialogRef}>
        <h3>About semi-salted butter</h3>
        Semi-salted butter is butter with some salt in it, but not enough to
        meet the legal definition of salted. In France, it means .5 to 3% of
        salt has been added. In America and South Africa, it means the butter is
        1% salt.
        <br />
        <br />
        <span className="source">
          Source:{" "}
          <a href="https://www.cooksinfo.com/semi-salted-butter">
            https://www.cooksinfo.com
          </a>
        </span>
        <form method="dialog" onSubmit={(e) => send("informationClosed")}>
          <input type="submit" value="Understood" />
        </form>
      </dialog>
      <form
        className="talk-form"
        onSubmit={(e) => {
          e.preventDefault();
          send("submit");
        }}
      >
        <select
          disabled={!matches("departementsLoaded")}
          onChange={(e) =>
            send({ type: "departementSelected", departement: e.target.value })
          }
          defaultValue="default_value"
        >
          <>
            <option disabled value="default_value">
              Select your city
            </option>
            {context.departements &&
              context.departements.map((p) => (
                <option value={p.numeroDepartement} key={p.numeroDepartement}>
                  {p.nom}({p.numeroDepartement})
                </option>
              ))}
          </>
        </select>
        {context.departement && (
          <fieldset className="butters" disabled={!matches("butterSelection")}>
            <legend>Favorite butter</legend>
            <label className="radio-input">
              <input
                checked={context.butterType === ButterType.UNSALTED}
                type="radio"
                name="butter"
                value="soft"
                onChange={(e) =>
                  send({ type: "butterSelected", butter: ButterType.UNSALTED })
                }
              />
              Beurre doux
            </label>
            <label className="radio-input">
              <input
                checked={context.butterType === ButterType.SEMI_SALTED}
                type="radio"
                name="butter"
                value="half-salted"
                onChange={(e) =>
                  send({
                    type: "butterSelected",
                    butter: ButterType.SEMI_SALTED,
                  })
                }
              />
              Beurre demi-sel
            </label>
          </fieldset>
        )}
        {matches("valid") && <input type="submit" value="Submit" />}

        {matches("submitting") && (
          <div className="loader-container">
            <Loader />
          </div>
        )}

        {matches("error") && <div className="error">{context.error}</div>}
      </form>
    </>
  );
}

export default App;

function Loader() {
  return <div className="lds-dual-ring"></div>;
}
