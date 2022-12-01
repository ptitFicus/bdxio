import { useRef } from "react";
import "./App.css";
import { assign, createMachine } from "xstate";
import { useMachine } from "@xstate/react";
import { departements } from "./data";

export interface Departement {
  numeroDepartement: string;
  nom: string;
}

interface Butter {
  id: string;
  name: string;
}

interface ButterContext {
  departements: Departement[];
  departement?: string;
  butters: Butter[];
  butterType?: string;
  error?: string;
}

const DELAY = "500";

type ButterEvent =
  | { type: "submit" }
  | { type: "departementSelected"; departement: string }
  | { type: "informationClosed" }
  | { type: "butterSelected"; butter: string };

const butterMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QCMCuAXdYBOA6AdgPYAiYADgIbZYC2Y+6AxBOVbfegMpgA2YAxlggBtAAwBdRKDKFYAS3RzC+KSAAeiALQA2ABwAWXAFZdATn27dogIwAma9YA0IAJ6Jbe3AHYbAZh-Woj6iegC+oc5omDi4AG4UPHIQjLCoyDQKYpJIIDLyisqqGgiaDrpe3tom1qY2tkamur7Obgi6Rka4vu2+vka2utr6JvrhkRhYeKnpCor4UMzKYLhy+LGEANbLUZO40xmYq1AIq+v8FAX4WVmqeQpKKjnFpbZBxqbd+tqfpka+2i1EKZtBV-tpREELNpTF5TLYxiAdjF9rMjowcNhCHgyDwLgAzLE0XBIqZpA5zY6nQjnS7XCS3WT3QpPLTWfy2XDaOzckyvXx2QEIKqiYyDAa9KqWDoIkm4DFYxhqWDoC7LCh4yYACl8ENEAEpGLL5dgbjk7pciqzrF5tN4IfpfMDRL12rpBUZPKZTA49L59PavPCIoiJjESdw+IIHot8MtlariaG8OHeAJafSzYyLSySoFgbg2bZel9vbCvEZBV4rF0Pg1rPpzLprdYZUnE9FsBG0w927seIQKBAjgAhJMx5ZUra9sNJrtR5TTvD9wcjpMnNbUi4POnZaRZh6WkrlCodD1DEL1d0erp2fr9L0hfQt4OylORy6LgiEUcdw2z1OCJApp7vkB45jo-S4E2T5DEWXiBH8gogroN62PUJgNP4Rith2i5zh+qwEtgNBbgu6DYBQ+DyBwjDAbk+7MqAzyBr4uAWEYXjwUEohGNY7SCoERa4I05bQta-KcUG4y4W+3YLoRhKkfguDkZR1EMLR1i7vRoGMeoWjwRU1hVH8XpGEEHheAJbIVA2OqOvoDY8VyOG7LJ87KQpxFKXEcjyMgfCMF5JGXAAwv2sBARmIFMo8TFaB0KF8cZzpco6bJOK4iBlCh3yiAMMJskYT5eOEwZECw8A5CSDK6XF+m5voHgFtoti1OKfICllCDWNeAy8Q2rU2tCRauTERCkJQ1BgHQDC1bFh6aN6IoNOZFj5VyyGCrYwy4P19bArYw1wr4Y14PEiQQPN2bxbmrzWMJjq-HxsJteWlawsJQRNA6PgfA4Z17GSqLzNdYG3aU-hJa17VNJ1tiCu0to+IM9YdU9gMotEV2ZnVi12G8VTfF8Px-AC3WBN8oqibxogwSCgPGmDenPGy-xdDq5S9bo8Pup63rGT9AZSSGMn-u+4M6Qt4Ewqxp7aOerUVt1-gVFWAtNMZsEi6+4tycpNW49LENwp08uK5e3VfMjZhlPyCtNTrbbuR+srLkO8w-pMzP1c8VQclWHgGK1CsfPoV6dOrojHg+QzPtJbl6x5n5EF7OA+4tPMcuZfrWsC5TK60egB3xJMeDUaFO2LHb4T2soQEsGfgd8picrxjRWNymWtE2D0cTUViwk1f2Ay7PbBUpTcm0J+jwdaBgV74lutP9wkF2JXgSYGo9JwR+BESFPaqVRcgcFPDWaAXbFz1WT4ncv2X5SKIkeqWW9V4nNcAXvB8+bEflyACmAc+zwGwnjsL8GEjRrTwQEk-Neok34wI-jOL+Et5L70Uh+AAFkkFg9VzSS2eLxCoIQbSzzak2Ti3dsr9U5AMZsAwGwfG0GVUIQA */
  createMachine<ButterContext, ButterEvent>(
    {
      context: {
        butterType: undefined,
        departements: departements,
        butters: [],
      },
      predictableActionArguments: true,
      initial: "noDepartement",
      states: {
        noDepartement: {
          on: {
            departementSelected: {
              target: "butterSelection",
              actions: assign({ departement: (ctx, evt) => evt.departement }),
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
        submitted: {
          type: "final",
        },
        error: {
          after: {
            "3000": {
              target: "#butter.butterSelection.butter.noButter",
              actions: [],
              internal: false,
            },
          },
        },
        butterSelection: {
          type: "parallel",
          states: {
            butter: {
              initial: "loadingButter",
              states: {
                loadingButter: {
                  invoke: {
                    src: "fetchButters",
                    onDone: [
                      {
                        target: "noButter",
                        actions: assign({ butters: (ctx, evt) => evt.data }),
                      },
                    ],
                  },
                },
                noButter: {
                  on: {
                    butterSelected: {
                      target: "done",
                      actions: assign({ butterType: (ctx, evt) => evt.butter }),
                    },
                  },
                },
                done: {
                  type: "final",
                },
              },
            },
            information: {
              initial: "transient",
              states: {
                transient: {
                  always: [
                    {
                      target: "visible",
                      cond: "outsideBrittany",
                    },
                    {
                      target: "hidden",
                    },
                  ],
                },
                visible: {
                  on: {
                    informationClosed: {
                      target: "hidden",
                    },
                  },
                },
                hidden: {
                  type: "final",
                },
              },
            },
          },
          onDone: {
            target: "valid",
          },
        },
      },
      id: "butter",
    },
    {
      services: {
        fetchButters: (ctx) =>
          fetch(`/api/butters?departement=${ctx.departement}`, {
            headers: {
              "x-delay": DELAY,
            },
          }).then((resp) => resp.json()),
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
      guards: {
        outsideBrittany: (context) => {
          return !["22", "56", "35", "29"].includes(context.departement || "");
        },
      },
    }
  );

function App() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [{ context, value, matches }, send, service] =
    useMachine(butterMachine);

  service.subscribe((state) => {
    if (
      state.matches("butterSelection.information.visible") &&
      !dialogRef.current?.open
    ) {
      dialogRef.current?.showModal();
    }
  });

  console.log("context", context);
  console.log(JSON.stringify(value));
  if (matches("submitted")) {
    return <div>Thank you !</div>;
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
          disabled={!matches("noDepartement")}
          onChange={(e) =>
            send({ type: "departementSelected", departement: e.target.value })
          }
          defaultValue="default_value"
        >
          <>
            <option disabled value="default_value">
              Select your departement
            </option>
            {context.departements &&
              context.departements.map((p) => (
                <option value={p.numeroDepartement} key={p.numeroDepartement}>
                  {p.nom}({p.numeroDepartement})
                </option>
              ))}
          </>
        </select>
        <>
          {["butterSelection.butter.loadingButter", "loadingButter"].some(
            matches
          ) ? (
            <Loader />
          ) : (
            context.departement && (
              <fieldset
                className="butters"
                disabled={
                  !["noButter", "butterSelection.butter.noButter"].some(matches)
                }
              >
                <legend>Favorite butter</legend>
                {context.butters.map(({ id, name }) => {
                  return (
                    <label className="radio-input">
                      <input
                        checked={context.butterType === id}
                        type="radio"
                        name="butter"
                        value="soft"
                        onChange={(e) =>
                          send({
                            type: "butterSelected",
                            butter: id,
                          })
                        }
                      />
                      {name}
                    </label>
                  );
                })}
              </fieldset>
            )
          )}
        </>
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
