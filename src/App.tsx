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

type ButterEvent =
  | { type: "submit" }
  | { type: "locationSelected"; departement: string }
  | { type: "informationClosed" }
  | { type: "butterSelected"; butter: ButterType };

const butterMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QCMCuAXdYBOBiANgPYDGAhugJaEB2AymPmMVhANoAMAuoqAA6GwKlGjxAAPRAEZJAdhkA6AKwAmRZOUBmSe3YyAbBo0AaEAE9EymeyV7JKvZoAs7Q3scBfdybSYcBEuRUdAxMLKyS3Egg-ILC1KISCHZq8gCcuo6pjooayg52JuYIiiVphjIajsrqKop6nt4YWHg+zfSMzJAckXwCQkEJUtp68o4ykraaqTlqxmZSABwa8rKZenqpC5apch5eIK048hTUAG6k+BQQuBA0YPKw6OT3h9jHZxdX3aIx-SJRiTsMkUowWmx0blkqTmRWcI3YjnUlXYC0UVhR9X2r3e50uEHkRDIcQJhFIEBOUAAMgE4rAbnccYQANYvJpHE64q4kolBElkinUnk0WAIDk0oLdb5RX5xQYIPQuNILFEaaZVSpuQqIBwg9ipfV6GTKaaQ1INA5st4cz74wmBGjvABmhGwAFt7dQACIUWC8fCkUyQXAnZ1uj0AYSIsC6XB+fVlAKkxpG1RU1SyygWiK1xXYIKyLg0KjB6iWMnN2OtePk2PQ2FI1EEYGo6FwUt6sQGiYQFVSaRkWcUWQHyskjhzml1KhRW0RS1RGgrlpxNpry7rDabLbbETjnf+oESMkcy1k6x2RczuVSObHfbG6U2yoVbjkS98b0511gqGQrqE7bRPGXaHog6SSGkdSqkOWQ1DCiDKss9iQlUxrSHsjQfg8v7-pgFL0tQ9xiiya5YT+f5CJQ1BQKKZzijQkqxtKwEHuIiCOAsIzQlU2QOOsDjsHoOY7NY0yWOw0hDkOgnvs02EUXh1G4Dg2AuvIfrkKGrqkXJ5G4VRNFikK1CMT0QH7vE3ZosoozrOoqTVMCkiVDmSzWAYlTbHqCwyNCslHCpLq4GIjzPPIpCOs0AAUig6OwACUuDYoF2CATKIFsT2zlKEWRbpGMihLJIrmpCM-FVBUA7sMoyh7Ps1CEBAcCiK8e5-JZoEICeCxlDxdR5OsyiCTmAC00gKNOYLjM4GgIo4mKYXJVZXG1CadbFCjgksapOJq8wICNmZKENYJZqkdhjka-lWh81Z2mt5ntXKJT5sq22KOq83jvtRYQfojiIhxeiFcDkjXSud30dQfLktRgoevAzEWXKOryFmGjrJxkg7OdMg5rFCzg8ttpQ9yHoAILnBQ-rIIwiMdk93aovmmbGlmzhLBoeP7ajer6vNqqcQ5yhE7dXL3byIYuu6cTer6-qBhAq0ZYCY7wi43lqJkH3KDmAPWP9J4aKiIkGKLX5k8StyEcrrGAte8g6FU52WAYmT4xs8gbGObNWHYGzm6urVI4z616D10wY5xhhc4Yus89YD7aBJ1nAtVgfVrW9aNhQzboLbHWZbYXE5OHHmx7kE65I7k0uNZElmliy7EzpRwNQAQpaBdyrB8jAqVeoVGCJ43vtdg2UaFSIi9sXTITTdYS32KvO0oSQN33bndYlRVG4KLDPHRSaDZebVBJqjTxM4NfhvnXnSXs3SHPqbCYqWYYpIPkIgqYML7pOGUQpLfTKaI+zQkMM+Gq4lR5FCNCMBY2MtDA1qmCY04M9KUXXiHB6R5dB90qLIBYyo0S2G+kUaYfYcgIlOrYLWihwYpWAYkUhjsao7CWJMfQh8wJv2cOkDGbg8q-08EAA */
  createMachine<ButterContext, ButterEvent>(
    {
      context: { butterType: undefined, departement: undefined },
      predictableActionArguments: true,
      on: {
        locationSelected: [
          {
            target: ".invalid.location.informationDisplayed",
            cond: "outsideBrittany",
            actions: assign({ departement: (__, evt) => evt.departement }),
          },
          {
            target: ".invalid.location.done",
            actions: assign({ departement: (__, evt) => evt.departement }),
          },
        ],
        butterSelected: {
          target: ".invalid.butter.butterSelected",
          actions: assign({ butterType: (__, evt) => evt.butter }),
        },
      },
      initial: "invalid",
      states: {
        invalid: {
          type: "parallel",
          states: {
            location: {
              initial: "loadingLocations",
              states: {
                loadingLocations: {
                  invoke: {
                    src: "fetchLocations",
                    onDone: [
                      {
                        target: "locationAvailables",
                        actions: assign({
                          departements: (ctx, evt) => evt.data,
                        }),
                      },
                    ],
                  },
                },
                locationAvailables: {},
                informationDisplayed: {
                  on: {
                    informationClosed: {
                      target: "done",
                    },
                  },
                },
                done: {
                  type: "final",
                },
              },
            },
            butter: {
              initial: "transient",
              states: {
                transient: {
                  always: [
                    {
                      target: "butterSelected",
                      cond: "butterPresent",
                    },
                    {
                      target: "noButter",
                    },
                  ],
                },
                noButter: {},
                butterSelected: {
                  type: "final",
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
              },
            ],
          },
        },
        submitted: {},
        error: {
          after: {
            "5000": {
              target: "#butter.valid",
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
        fetchLocations: () =>
          fetch("/api/departements")
            .then((resp) => resp.json())
            .then((dpts) =>
              dpts.sort(
                (d1: Departement, d2: Departement) =>
                  d1.numeroDepartement > d2.numeroDepartement
              )
            ),
        submit: (context) => {
          return Promise.resolve(1);
        },
      },
      guards: {
        outsideBrittany: (context) => {
          return !["22", "56", "35", "29"].includes(context.departement || "");
        },
        butterPresent: (ctx) => Boolean(ctx.butterType),
      },
    }
  );

function App() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [{ context, value, matches }, send, service] =
    useMachine(butterMachine);

  service.subscribe((state) => {
    if (
      state.matches("invalid.location.informationDisplayed") &&
      !dialogRef.current?.open
    ) {
      dialogRef.current?.showModal();
    }
  });

  console.log(JSON.stringify(value));
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
        <fieldset className="butters">
          <legend>Favorite butter</legend>
          <label className="radio-input">
            <input
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
              type="radio"
              name="butter"
              value="half-salted"
              onChange={(e) =>
                send({ type: "butterSelected", butter: ButterType.SEMI_SALTED })
              }
            />
            Beurre demi-sel
          </label>
        </fieldset>
        <select
          onChange={(e) =>
            send({ type: "locationSelected", departement: e.target.value })
          }
          defaultValue="default_value"
        >
          <>
            <option disabled value="default_value">
              Select a city
            </option>
            {context.departements &&
              context.departements.map((p) => (
                <option value={p.numeroDepartement} key={p.numeroDepartement}>
                  {p.nom}({p.numeroDepartement})
                </option>
              ))}
          </>
        </select>
        {matches("submitting") ? (
          <div className="loader-container">
            <Loader />
          </div>
        ) : (
          <input type="submit" value="Submit" disabled={!matches("valid")} />
        )}
      </form>
    </>
  );
}

export default App;

function Loader() {
  return <div className="lds-dual-ring"></div>;
}
