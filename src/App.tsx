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
  /** @xstate-layout N4IgpgJg5mDOIC5QCMCuAXdYBOA6AdgPYAiYADgIbZYC2Y+6AxBOVbfegMpgA2YAxlggBtAAwBdRKDKFYAS3RzC+KSAAeiALQAWAEy7c2gOwA2IwA4AnKN0BWAIzaH2gDQgAnonsnRuW7otzE0sjUSNtewBmWwBfGLc0TBxcRKxsbj5BJXxmZTBcWHQKLBSMNNKk9N4BRWUxSSQQGXlalUaNBB1bc1wAiMt7cyNdJ3tdN08Ee0GTPwcQy1tI-THIuISy5NScDJrsivKiACFNqsyhRm2zmsh61WaFbNUOzV0THttLZYjI4YGgiaIHyzAb2IyRSKibSWIb+dYgK4HHbVLLKJF4HiECgQOT4KAnSq5fD5XEAN0IAGt8oirrtUfh0bhMdjcfjTggyYR+MVsvU7o0Hq1nlpbKJ7LhptobJZdNFptMTICELYTAZomLBhDwtYTPCaac6a1cLiAGaEbA0Hlo9DYCj4eQcRj86SyR7KYWdX6zbROEyfKzhUz2JUDIy4VUjUYmKKWbR607ow37U3my1Gm12h0MJ32BoulpPdpaSImWbgowViK2fzmAEeLyiMK4GGRbTvaaiaO6czxyqJlFGlMWq0MnGwMg8CjuSCMIdp7IAYUxsFuEnurqFRc6jgMonMfW05m6P0V9YQXx6oV0nd0A0W5givfKpIoPDkEEYsFQyBoCmdTQ3QtQBea9Il6MxjD9GxoShJUxibcI-X3URIjGWJ4gRBMvx-BRFDxIkSXwckqUZbDf0wVkOSIrkRz5NcBUA90twcCUfRCXR7EWL5S0iODb0sXBwmWSErAGVsn2SMjcNZRgcGwc1cAnYozQtUjv3IvCoCo8luVaOi8wAgsmOArwvlwSETDbWVPk4oxLCVIIeh+ewoRcuw-UsCS8Dk81GDUQpinyCgTTSAAKSFGwASkuBMfOwf9BSA9REGvMMK38VYbIWJV5mbaZIQhAYliCOIMKIFh4EaK51yMtoTM6UtbEEuzo3MCEgjMcwlSMcV-ECSyfTCWw2y8ggSFYagwDoBgardOrkoasFmssVr2tLCw4KGXA2s+bpVWGYILFG2kBySxLjIWzQfAMP5dp9bQ5XGM8+kEw9gh9fRzFc46DVOtFqoY2qPU0YaBMlaVrPlJ7JhLMDwiGMFbMiEJ7B+yok3+hNjl+85IFmzd6p0WtwwOkYuLsmxT0mMwwNvUxGwsMm0bSDGGURCA8nxpKXhlcz7zbUsXNQmUlVVHoTEiNrG1rbshmZ5Fzn2RFmRxPECTSLmLpeQ8BNCaxbHLMJwTBJUnBuw8epQvc92GdCNj7E7FbROcR01+aXmrbRBNvO6fUe7qBkE4WfBlfj9Hl656WNfAVPna1bXtOQODd4HRTLH3FnuuVgzPEJfAfRY939H3UYw-V0b+hkXaNAALd8WHm873a0Fyw1+aY887I9pjglCDCGIx-F+dUoiMCPWej2OR1wMclOnCAU63TRHFmYJRCWW8-YcHPJlrXxjZlB7DrsuMy4TF83wXwG5uByEmt+IJOLao9M9sPjO2bFbulAtDRqkii8SL0JkePw7FB42CCJLd4cFNSGC-shVCdg-7qVwnja+BMFpjC9pYeBP87B8VvIJd4X03h6H3LKUacUgELX0AJboFZMp3jsqLEYEp14jCQmJcwpc4hAA */
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
        butterSelection: {
          type: "parallel",
          states: {
            butter: {
              initial: "loadingButter",
              states: {
                noButterSelected: {
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
                loadingButter: {
                  invoke: {
                    src: "fetchButters",
                    onDone: [
                      {
                        target: "noButterSelected",
                        actions: assign({ butters: (ctx, evt) => evt.data }),
                      },
                    ],
                  },
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
          {matches("butterSelection.butter.loadingButter") ? (
            <Loader />
          ) : (
            context.departement && (
              <fieldset
                className="butters"
                disabled={!matches("butterSelection")}
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
