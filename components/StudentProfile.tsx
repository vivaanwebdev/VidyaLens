type Props = {
  studentInfo: any;
  schoolName: string;
  academicHealth: number;
};

export default function StudentProfile({
  studentInfo,
  schoolName,
  academicHealth,
}: Props) {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

      <h2 className="text-xl font-semibold mb-4">
        Student Profile
      </h2>

      <p>
        <span className="text-slate-400">
          Name:
        </span>{" "}
        {studentInfo?.name}
      </p>

      <p>
        <span className="text-slate-400">
          Class:
        </span>{" "}
        {studentInfo?.class}
      </p>

      <p>
        <span className="text-slate-400">
          School:
        </span>{" "}
        {schoolName}
      </p>

      <div className="mt-6">
        <p className="text-slate-400 mb-2">
          Academic Health Score
        </p>

        <div className="w-full h-4 bg-slate-700 rounded-full">
          <div
            className="h-4 bg-green-500 rounded-full"
            style={{
              width: `${academicHealth}%`,
            }}
          />
        </div>

        <p className="mt-2 font-bold">
          {academicHealth}/100
        </p>
      </div>

    </div>
  );
}