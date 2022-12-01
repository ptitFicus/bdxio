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
  /** @xstate-layout N4IgpgJg5mDOIC5QCMCuAXdYBOA6AbgIYA2AlhAMSyrIC2p6A2gAwC6ioADgPawOncAdhxAAPRABZmATlwBGAKwBmAEzSFUgBxzNAdk0AaEAE9EuiRNwqF6hYt3S5ANjkSAvm6NpMOXNToM6KSCUBQQQmC4wfjcANaR3lh4-vSYwVAI0dwAxoRBQiyshSI8fPnCSGKICi64CjUSSprMMhLmCkamCLr1uErSTg5qDU41Hl4YSX40qUEhFDjY3HicxHkAZsu0uIm+KYHpmYIxueWFxZWl-EIi4ghKunK4mv1yuk4y1nJKEp2I6ko+nZpEoHk5pNYJCpxiBdnhFssKKJYOg8pFCOskgAKBQtZgASgocNwCOwFy4vGuFVAdxUqismgk3xeFgkCm0vxM1ScmjqPxsrikChUKncnlhk18xG4hAg6QAImBOIRsFhaGBBOhYGEIlFjnEEpK8NLZQqlSq1RqtUcTnkBIJzmwSpTyrdEEo5Mx5FJmKMIZoaho-ggVLoVLgHE0Wjy2jInDDiXCAMpgYhgbLlHWCSIotE7I35nzYFNpjP28kgK6uyp3JxSZ6OZS6JQ2ZtQ4NOUa4aRSMPKEGelsJgvJ1Pp8p6zbYWh2oS4dDYQiCPhWigVqv2t0IaTSXlgkWaD5OUVtYNKZi8x4fJmadR1x7DouFpIl8f2ydbWeCeeL5ekVeMHI7CXC6m41ognrfFYujMD0u41CeujBm0lg-I0DwOFoEjxuKiZGq+ZZzsEU4zhOcqwKshDGJAFDEZ+5QAMLSrAkDrqBNzgQgchyCCuDgtIuhweCwpOMhii4C06gvMwNQPDouiPlMo6lhOxJgLQnDoMYRL4WOGasU6IFlGBNL-HoVgehI2iHkyqhKMGMFeu8EgQiogxqNxYoTE+EDmqq6lWrAAAyMq+ZQvnKv56qagRWAQGxxkcaZCA1LIAmdioLzCR6Z4QhJoLMCoMmyY8egeOKgjcL58CVHCzqJdSVRcYyDK2SyFjsq4Z6Xs4zA3nesbqIpvhEGQED1VSW6NOG2j6M0cgiqGPT2VyCCjLouDYT2zA8TIwpucNyQzAcIQTdWyVgnUF7vMKPzMHZHSrZoop9C0mgvNIsEwRoh3TAEPjjUZk2cU4DxWAJ+iOEo4I5U9Cgbdh70WC2DyFb9pJnSZTV0rIs2Cdofqg52DnqM8MEgmoLh0kyv0mnKISKpFlqajVFINVu55PKG8O7tDg5IatihPA4jLHmyMj3Qtv3KW+SWVuxjV3M0Ch1FCeISy4AnBgtG1Xn1OgDQ+uEjrpKnvnR05fpjctK8oqtFXin2awLXQqM4Ea9f1DRG95Smm7L34W6R74LkuK6atbiv-Dt9vq07PEu5IRWbaDHqMrBIKNApxtPjLhGB4IJFfrg5GUdRgNs8DyULcn+gyZC2iIWeMke9eBve3I0v+-nH6WxOAAW5C+Y1G42xBbuyIJb2i+obnITBzzIxh22i13Raxe+dVA+dTV6LyoYycjdbfHSHbcRGdaue5jiuGvL56apBbqZpXSVzvdwQk40GH40x92cGs0+jWAFC4Z6OM744A3nOPCRYABqJByCRy3J6cyKFPT3Ssi2HkAD3bPXqI4UBIp+i-QihaAKLMQqykgEgzid0+JDHWvDTs4JORdB9M8N4FNOzw0RtnDwQA */
  createMachine<ButterContext, ButterEvent>(
    {
      context: { butterType: undefined, departement: undefined },
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
        {matches("valid") && (
          <input type="submit" value="Submit" disabled={!matches("valid")} />
        )}

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
