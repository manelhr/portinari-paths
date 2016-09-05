import numpy as np
import regex
import functools
import timeit
import sys


def recursive(_time, _diagnosis, time, diagnosis, exams_range, acc_time=0, acc_exams=0, first=True, p=0):
    # print('---')
    # print('pat:', diagnosis, time)
    # print('act:', _diagnosis, _time)
    # print(p)

    if len(time) == 0:  # case 1: pattern ended, returns true
        return True, p

    if len(_time) == 0:  # case 2: string ended, returns false
        return False, p

    try:  # case 3: if first pattern element cannot be found, returns false
        start = _diagnosis.index(diagnosis[0])
        if not (exams_range[0][0] + acc_exams <= start + 1 <= exams_range[0][1] + acc_exams):
            print('< return exam')
            return False, p

    except ValueError:
        return False, p

    # Sets success to false, sums the time skipped
    success, sum_time = False, sum(_time[0:start + 1])
    total = sum_time + acc_time

    # print('acc:', acc, 'start:', start, 'sum:', sum_time, 'total:', sum_time + acc, 'first:', first )
    # print('rls:', _diagnosis, _time)
    # print('rls:', "    "*start, _diagnosis[start], _diagnosis[start+1:], _time[start+1:])

    if (time[0][0] <= total <= time[0][1]) or first:  # If the time is right, or first, "enter"
        print('> in')
        success = recursive(_time[start + 1:], _diagnosis[start + 1:],
                            time[1:], diagnosis[1:], exams_range[1:],
                            first=False, p=p + start + 1)

    print('< return time')
    if not success[0]:  # If it doesn't work, "outs"
        if first:  # If its the first, "outs" with acc=0 and first=True
            print('> out first')
            success = recursive(_time[start + 1:], _diagnosis[start + 1:], time, diagnosis, exams_range,
                                p=p + start + 1)
        else:  # If it is not, "outs" with acc=sum_time + acc, acc_exams +=1 and first=False
            print('> out not first')
            success = recursive(_time[start + 1:], _diagnosis[start + 1:],
                                time, diagnosis, exams_range,
                                acc_exams=acc_exams + 1, acc_time=total, first=False, p=p + start + 1)

    return success


def match_time_sequence(string, diagnosis, time, exams_range):
    # appends 0 to the beginning of the time
    time = [(-sys.maxsize, sys.maxsize)] + time
    exams_range = [(-sys.maxsize, sys.maxsize)] + exams_range

    # splits both and separates the string
    split = regex.split('d|t', string)[1:]
    _time, _diagnosis, idx = list(map(np.uint32, split[0:][::2])), list(map(np.uint8, split[1:][::2])), 0

    print(_time, _diagnosis, exams_range)

    result = recursive(_time, _diagnosis, time, diagnosis, exams_range)

    print(result[0], diagnosis[result[1]:])

    return result, diagnosis[result[1]:]


ex_diagnosis = [11, 10, 15]
ex_time = [(0, 1000), (1100, 20000)]
ex_exams_range = [(1, 1), (1, 1)]

ex_string = "t0d11" + \
            "t0d10" + \
            "t1100d15"

f = functools.partial(match_time_sequence, ex_string, ex_diagnosis, ex_time, ex_exams_range)

print(timeit.timeit(f, number=1))
