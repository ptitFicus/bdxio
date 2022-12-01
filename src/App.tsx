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
  /** @xstate-layout N4IgpgJg5mDOIC5QCMCuAXdYBOA6AdgPYAiYADgIbZYC2Y+6AxBOVbfegMpgA2YAxlggBtAAwBdRKDKFYAS3RzC+KSAAeiALQA2AMy7cAFl0BWAEwB2MyYCMF3TYAchgDQgAnojNntuG3osrQxNRCxNtRwBfSLc0TBxcHkIKCDl8KAAhDCxsZmUwXDSAN0IAawK4nMTk1PSs+OwEYsJ+CkVlMXFO1Rl5dpUkdS1tUV8LR1FRAE4pmynLEdcPRENA3D0TR0XjGxtzaNjshKJ6nMZKnG4+QUhuwd6FJQHQDQRNE3ncRydvi2NZqb6NyeBDabQWXC6QxTRwWUa-bQ+A4gC54IoUHhyCCMWCoZA0BR3aSyR7KVSvd5goxWRwhHzWGG6YGIRy0owOfSGOwWbQmBzI1G4XH4hSKdJ5fAFZrlXCC4UEzBpKBNfAlVr9TpEkAPfrkrSGb5+XRmUQmf4LbQ2ZkIGyjUSQxGiQyiE1OMy6AVHPDy0VKxg4bCEPBkHhtABmQZosq9QrxCrFyua6qemokPRJusGFMCjlwJh5NLNU0Mzqm1qmtiM0K2UwsszB4M9DVwAaDjDUsHQbQKFDDOQAFLpJqIAJTnGOt7BanVPPVvCy7XB1p2mwzu7QwszWj5mL4+aFm1kG1bRGIgIgseCDVHpvqzrNaRw+PMFsy06El6bWhe4F3jLYls6YQGk2VREKQlDUGAdAMLepLPEMbyWhCgRTJajj6Fs4KONa-j2n+rLaIBoSHqBCRJCkSqnDgcGZi8ww2AYxpgmYMy6ACULWqYhhLrahi8n8sxOlEZ6CicXq0fe9FvOEuY2JYa6MchcxLCCmwQrs6HgoEYSjGRaIYliklkg+MkbpCug8v4Pj2E4JjWhMEKwkO7owhE-gmPpsYioq6TGQhFKbFMuDun8oxcgsTrlpsuAwmhJa6BEBpoV5PrxBA-lzpoxi7nY+gjD8ExmFayw2v4PFWLyilFiBokTtggbYJlpmaLp6x-NYfILtMug4aV3WQtW9hbKMgQ2KekRAA */
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
              target: "loadingButter",
              actions: assign({ departement: (ctx, evt) => evt.departement }),
            },
          },
        },
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
              target: "#butter.noButter",
              internal: false,
            },
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
              <fieldset className="butters" disabled={!matches("noButter")}>
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
