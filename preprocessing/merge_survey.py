# # ---------------------------- # # # # #
# # AUTHOR: MANOEL HORTA RIBEIRO # # # # #
# # ---------------------------- # # # # #
# This script simply separates the survey data three big files. Most specifically, containing the data on the first, the
# second and the common questions of both surveys. It should be run separately from the make all function (for now).

from preprocessing.format_rows import pre_process_exams_query

_original_name = "./data/surveys/surveydata.txt", \
                 "./data/surveys/regdata_update.txt"  # original data-sets

_pre_sv = "./data/surveys/"

_srctmp = ["s1.csv", "s2.csv", "mixed.csv"]  # joins all data in one big stupid file

_undocumented = ["q14newpa"]

_survey2fields = ["q5aagsto", "q5esnu", "q5esnust", "q5fagsnu", "q5g1snu", "q5g2snu", "q5g3snu", "q5g4snu",
                  "q5g5snu", "q5g6snu", "q5g7snu", "q5g8snu", "q6adrk", "q6aagsto", "q6bsoda", "q6brwin",
                  "q6bwwin", "q6bdwin", "q6dbeer", "q6dsoda", "q6drwin", "q6dwwin", "q6ddwin", "q6dvodk",
                  "q6eagdrk", "q7cagpr1", "q7cres1", "q7cagpr2", "q7cres2", "q7cagpr3", "q7cres3",
                  "q7cagpr4", "q7cres4", "q7cagpr5", "q7cres5", "q7cagpr6", "q7cres6", "q7cagpr7", "q7cres7",
                  "q7cagpr8", "q7cres8", "q7cagpr9", "q7cres9", "q8bpill", "q8bagpi", "q8bdupi", "q8bmini",
                  "q8bagmi", "q8bdumi", "q8bspir", "q8bagsp", "q8bdusp", "q8both", "q8bagot", "q8bduot", "q8cmapi",
                  "q8cagma", "q8crema", "q10conew", "q11bno", "q11bco", "q11bhor", "q11bsafe", "q11bwith",
                  "q11bmorn", "q11both", "q13youpa", "q15risk", "q15agchl", "q15agher", "q15agtri", "q15aggon",
                  "q19vac", "q19agvac", "q22awork", "q22bhome"]

_survey1fields = ["c6c2wine", "c6b2beer", "c6b3soda", "c6b4rwin", "c6b5wwin", "c6b6dwin", "c6b7vodk", "c6aagdrk",
                  "c7aagepr", "c8aageco", "c8bhormc", "c8cyrhor", "c11conew"]

_dest, _src = (_pre_sv, _srctmp[0], _srctmp[1], _srctmp[2]), (_original_name[0], _original_name[1])

# condenses survey and the diagnosis into one file
pre_process_exams_query(_src, _dest, _survey1fields, _survey2fields, _undocumented)
