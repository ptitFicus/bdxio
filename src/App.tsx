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
  /** @xstate-layout N4IgpgJg5mDOIC5QCMCuAXdYBOA6ANgPYCGEAlgHZQAiYADsdlgLZgXqwDEEhFYulAG6EA1vzSYcBEuSq0GTMK3awEQwgGNi6MrwDaABgC6ho4lB1CsMjt7mQAD0QBmAOy5Xn5wBY3AVgAaEABPRAAmMIA2XG8DAE4ARlc4yIAOVz8AX0ygiSw8CHpGFjYOABkZSG4ixWV0AGUwfDANLAhTe0trWwp7JwQAWmcw1Nw-Az8UyITUyL8wn28g0IRnGdwE6ciwhMSk7z8-SOzcjHzcPJxG5tbdCguzqSU6dGDOS+xrlraOpBAumx3PqIAYjZwxPyuabeMLzTxxJYhRCQuK4KbxebeSKubyJE4gD64QTEfBkCCcWCoZDMGy-CxWQF2P79UEGcFRHFQ8ZhXEGRErBJhAzuHFzVJCtaw-GEynUmw6KjcXj8dRiB6SPCymmYShQNQUYRaHqmOn-Bk9YEIOKjCYGMJxe1pDLLRAJBJ+by4VJ+GYGSKRWLbLI5AmPTVU7UKqCcHDYQh4Oj4bQAM3jzHV5y18t1+sN2juJuMnXNQOZLjC7mFfL8zjiBj5bk8LqtDtwCzSm0DUpDhNj8c4Dlg6G0-GIyfyAApnPWDABKd5h3B97CmgEWsurbwJMa1iV1hueVzNgPg1zOcbuyJxeYRVzSxcfL63XgCCip7DMfMv9DYYgUaylJwq4lkyoAsv4XqpPEnipFuCQ+O6zapHWHjeKk8FHIc9apPeGoZlcTTfHcr7vp+PS4D+f4AewQEJGYfxrqWYEgs4-obGe8RCtaCL+oESJWuhGzxO6sx8hEaS4ecj6Ec+9yUKRX73OQsCJsQwRVPJaaKQAwkQsCQMB3RMY4IIJFuYy+tsUFCq4mx8SsexehWGQIWs1oJJJUjSTcPRKnwuBDiO+F4N5RH6EWDEgb0G4DAcowVluiTpDyPphM2bqzGMPpxMkNYRIKzjZCGFCEIU8B-B8xZGaBJmDHMBgbAGiTOM4qRQZxzYDH4aJxL11pbuhrizAlnl4EQpC6vIxRKKU5X0tV0XMQgMJIYVPaLoUCglCoFSkJAVWMottU4rg2wHG6tnpLiOXNj4DWtehsFwTihzHOteGhbJB3rktAyRHajW4vBD31g6zaxOC6LWi1wz2uko1EiSZLfcZ4ETLgbizLsqStZMHr2a6QrRL1YoSoKwanHhWY6lQKM1Sy3pjDlFbcrMrVpOlMzgripNsuTCPU20dNHf0gqeiTfjinzsLpREqJQm1doBiMERrZT5zLsLlqseC55JGy+6+IezacmiIzXm1DrigsCOfeRlWRQtlpdZsaJocrBiwehwrg4kaL+vE2LIdxFOhh9YZPvbi7PK8WsxViowIrMMKe2hCQ+-xkSsWM7XeJ4GKh4SdvEYSPB8HHv042MvjTlCgrut4-KIP9YQbA6cyeFiOJ4u9UkRzJ5GaR+ikV7VXUeoDzUgx1-Fcl6kLQmztbnrb-c+cRQ9kcRlH-mQpSjyy4zRJ2U+K8JBNWr4aIZLsdaJHfHm915a9hXJb5aeRAAWZKFEdjH06ZP0Xo-Q+lxOMcYiQL7pyAfWYYZkIjDSGqvDUkcN7v2HuRZSql1IQAPqZLEGxYTek9mfSBSEazzzru7FqcQV5FSAA */
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
          type: "parallel",
          states: {
            butter: {
              initial: "empty",
              states: {
                empty: {
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
                      target: "displayed",
                      cond: "outsideBrittany",
                    },
                    {
                      target: "hidden",
                    },
                  ],
                },
                hidden: {
                  type: "final",
                },
                displayed: {
                  on: {
                    informationClosed: {
                      target: "hidden",
                    },
                  },
                },
              },
            },
          },
          onDone: {
            target: "valid",
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
