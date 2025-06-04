import style from "./progress-bar.module.css";

const ProgressBar = ({ progress }: { progress: number }) => {
    return (
        <section className={style["progress-bar"]}>
            <div
                style={{ width: `${progress}%` }}
            ></div>
        </section>
    );
};

export default ProgressBar;
