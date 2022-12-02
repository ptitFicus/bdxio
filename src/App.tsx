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
  /** @xstate-layout N4IgpgJg5mDOIC5QCMCuAXdYBOA6AdgPYAiYADgIbZYC2Y+6AxBOVbfegMpgA2YAxlggBtAAwBdRKDKFYAS3RzC+KSAAeiALQA2ABwAWXAFZdATn27dogIwAma9YA0IAJ6Jbe3AHYbAZh-Woj6iegC+oc5omDi4AG4UPHIQjLCoyDQKYpJIIDLyisqqGgiaDrpe3tom1qY2tkamur7Obgi6Rka4vu2+vka2utr6JvrhkRhYeKnpCor4UMzKYLhy+LGEANbLUZO40xmYq1AIq+v8FAX4WVmqeQpKKjnFpbZBxqbd+tqfpka+2i1EKZtBV-tpREELNpTF5TLYxiAdjF9rMjowcNhCHgyDwLgAzLE0XBIqZpA5zY6nQjnS7XCS3WT3QpPLTWfy2XDaOzckyvXx2QEIKqiYyDAa9KqWDoIkm4DFYxhqWDoC7LCh4yYACl8ENEAEpGLL5dgbjk7pciqzrF5tN4IfpfMDRL12rpBUZPKZTA49L59PavPCIoiJjESdw+IIHot8MtlariaG8OHeAJafSzYyLSySoFgbg2bZel9vbCvEZBV4rF0Pg1rPpzLprdYZUnE9FsBG0w927seIQKBAjgAhJMx5ZUra9sNJrtR5TTvD9wcjpMnNbUi4POnZaRZh6Wkpecu4AztQJefT2coV1yIDq26zaew1fTWfrl1sdxdzy6LgiEKOHaGrOqaCJApp7vkB45jo-SnvWT5Xv4gR-IKIK6F0dj1CYDT+EYX67CmkZ-qsBLYDQW4Lug2AUPg8gcIwkG5PuzKgM8ga+LgFhGMeF6iEY1jtIKgRFrgjTltC1r8seQbjN+xHdguZGElR+C4DRdEMQwTHWLuLHQWx6haIGIpFv8HRCYJNheCJoiDLgEK+LYHx9H8IQtsGsqKfO6kqRRalxHI8jIHwjD+ZRlwAML9rAEEZlBTKPOxWgetYuC2A2XhCWeAxNiJbIVPWAkOlyMKluEwZECw8A5CSDKGclxm5lej7PrU4p8gKd4IO+toDIJDbPja0JFoRMREKQlDUGAdAMA1SWHpo3oig0RiiBYogeE+VaCplnQDfWwK2CNcK+ONeDxIkEALdmKW5q86UfF6gnlHCMK3q0x6mOJQRNA6PgfA4F17GSqLzLdMH3aU-iYU+LlbU0XW2IK7S2j4gz1p1jqmCDKLRDdmaNUtdhvFU3xfD8fwAj1gTfKKknWW+2ggiDxqQ0Zzxsv8XQ6uU766Mj7qet6T7-QGckhgpoEkVDBmLbBMLpfo2XWgYNRFvUgr+BU3yDErl4hG+IM+X+9VEwr0PlJhJVBNlFgA59iBfLaevQtlhtDJ58lETLSnqbKy5DvMQGTBzTXPB6nSNO1Dhst6-Luh0nLdO71r+l7Jt+75-5EKHODh0tTQirbfEO-hlZ+t4mV-UNLmBlnHa-j2soQEshewd8P1VDUlh1A4qMOMY2WNEE5gnaIuNeW2ps9hFakd9DZ3carVZvmdWs9UD4k3lJXgyQ30-S03YGkfg5GRT2mn0XIHCL81mg3ivDhrxrzlO71W0ihJHqlgfkveWzmfC+gVYjBTkKFMA99nhZWMHYX45Umx8Tsq8Hekk-7WkPj7GcJ9ZbKXPqpP8AALJILAmrmjlpHa0jkQRDEDI0TBThab2G-lYJGb4qweUqqEIAA */
  createMachine<ButterContext, ButterEvent>(
    {
      context: {
        butterType: undefined,
        departements: departements,
        departement: undefined,
        butters: [],
        error: undefined,
      },
      predictableActionArguments: true,
      id: "butter",
    },
    {
      services: {},
      guards: {},
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
