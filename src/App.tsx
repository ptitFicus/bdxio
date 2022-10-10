import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { createMachine } from "xstate";
import { useMachine } from "@xstate/react";

const butterMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QCMCuAXdYBOA6AlgHYBuAhgDb4S7kD2AxqevrYTbaREVADINMtCsAMQRWYAiVoBrCWkw5JZStTqNmrdp2591g2AiLF+GwgG0ADAF1EoAA61Y+U7ZAAPRAEYALLgBsAKwBAMx+ft7ewd4BAEzegQA0IACeiADsuDEAnJ6hOWkWwRZhwZ4AvmVJ8lh4RhRUouK4sOhMchg1SvUQrg5OLkjuiAC0ngAcY7hpnmklxVnenoEBSakIMTHBuBYRfmkxfmN+wQHRARVVHYrKDbCoyAC2zr2OzoKuHghjW36eseElTwbWarRAHSYRYIxCwWXLZGF+C4gaqKO6PZzMQhQRqECRGGTtBR4NFPTDcQxSPSsSw2QZ9N6sD4jTz+ManAJ+LIxMbRYJZCwxFYpRDBArbSKRNkxcaLNJIlHE+6kzHYnDYWh4OzkJgAMw1D1wCuaSox5PxVPM1he-Xeg0+0L8uCyOWOfMKFi5UNBCGC31wYxiaTGzr23n2fO88queDVGuEbhabVwpB1NQAFAEYRYAJTCI2x7DWhmEJkIUZFcW+74OoJ-b2xGK4bwTIqefkermIyrI6PCWBgchgejoABC0aLA1AnyykzZATbWTSAWd84W3uG8R+UUzme8COXXcuRL7A6H6F0AkZdNek6GPr+U19aTSwROQQsaSy67Svi5POXko8tMwQVN2hC0BAcCuEadQqIa0YACrJHYEjgWORITraU4jH6fiBr8i6cscwbrtKATbDMi7SrMISZnK3YwSQ3TwUSSEoSxNQAMqnsOkCYVe2EILETrEQEwaBp4ApZMEpEPrCn4hBYQRxEEUZEl0cEKmxYD8SWdrMh+-j4W2sxZMRX7CmW3IZPJi5QmGUIvmpnSwVQ7AWloXBYhepjwNeNoCXewzAo+QZZOyEy-CRlmjBYuDjGJ0xBnysQWGMzmKK5qgmII7mXoQACCZD4NqyCDn59g3lhd5xPFCzRG2gTNpmRzevymTHEGYxLK+0QTBltRMXBaj5XlpjcYOvE9P5xaltZToHNye7HJEsJ+N6cWfrkpzNX8eEEQNGluSNt70renzBfOoXBhFRzjBZazDAG8Vsmyoq9acTkMdGR3TZVAV6YJwVLtd4V9XdD0jCcWQUZ+P6lN1bbnN96k3H9IBndVF2CrgIS+iEcQTLsQprItTaREs4mchySmHSSppYrpc0zP4H7fHh0yJYK3qChkq2dcuRwnCBKOdPTCjo5jgXY06z7xMCPiwsU62WREGQbPOEQIoKYmHQWTP6QgSx882fgCsGfzFDE3pq5kgo+HuVtBOlos4AbQPZDDL5hbdBHrp9-jbsUniSa9MSgWUQA */
  createMachine(
    {
      predictableActionArguments: true,
      context: {
        butterType: "",
        location: "",
      },
      on: {
        selectButter: [
          {
            cond: "isComplete",
            target: [
              ".invalid.butterType.butterSelected",
              ".invalid.location.locationSelected",
            ],
          },
          {
            target: ".invalid.butterType.butterSelected",
          },
        ],
        selectLocation: [
          {
            cond: "isComplete",
            target: [
              ".invalid.butterType.butterSelected",
              ".invalid.location.locationSelected",
            ],
          },
          {
            target: ".invalid.location.locationSelected",
          },
        ],
      },
      initial: "invalid",
      states: {
        invalid: {
          type: "parallel",
          states: {
            butterType: {
              initial: "noButter",
              states: {
                noButter: {},
                butterSelected: {
                  type: "final",
                },
              },
            },
            location: {
              initial: "loadingLocations",
              states: {
                loadingLocations: {
                  invoke: {
                    src: "fetchLocations",
                    onDone: [
                      {
                        target: "locationAvailables",
                      },
                    ],
                  },
                },
                locationAvailables: {},
                locationSelected: {
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
              target: "valid",
            },
          },
        },
      },
      id: "butter",
    },
    {
      services: {
        fetchLocations: () =>
          new Promise((resolve) => {
            setTimeout(
              () => resolve(["France", "Belgique", "Allemagne"]),
              3000
            );
          }),
        submit: (context) =>
          new Promise((resolve, reject) => {
            setTimeout(
              () => resolve(["France", "Belgique", "Allemagne"]),
              3000
            );
          }),
      },
      guards: {
        isComplete: (_, __, { state }) => !state.matches("invalid"),
      },
    }
  );

function App() {
  const [{ context, value, matches }, send] = useMachine(butterMachine);
  console.log(JSON.stringify(value));
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <fieldset className="butters">
        <legend>Favorite butter</legend>
        <label>
          <input
            type="radio"
            name="butter"
            value="soft"
            onChange={(e) =>
              send({ type: "selectButter", butter: e.target.value })
            }
          />
          Beurre doux
        </label>
        <label>
          <input
            type="radio"
            name="butter"
            value="half-salted"
            onChange={(e) =>
              send({ type: "selectButter", butter: e.target.value })
            }
          />
          Beurre demi-sel
        </label>
      </fieldset>
      <select
        onChange={(e) =>
          send({ type: "selectLocation", location: e.target.value })
        }
        defaultValue="default_value"
      >
        <>
          <option disabled value="default_value">
            Select a city
          </option>
          {["Pays1", "Pays2"].map((p) => (
            <option value={p} key={p}>
              {p}
            </option>
          ))}
        </>
      </select>
      <input type="submit" value="Submit" disabled={matches("invalid")} />
    </form>
  );
}

export default App;
