import csv 
import json
from itertools import dropwhile 

def valid_name(name):
    '''we don't need the global statistics or the first line
    '''
    return 'Stadt München' not in name

def prepare_name(p_y_n):
    '''we don't need the numbers in the front
    e.g "13 Bogenhausen"
    '''
    p, y, name = p_y_n
    cut_name = dropwhile(lambda c: c.isdigit(), name)
    # print (name, '|' , ''.join(list(cut_name)[1:]))

    return p,y, ''.join(list(cut_name)[1:])


def transform_voter_turnout(p_y_n):
    '''Some rows have data for multiple districts, we want a single row per district
    e.g "Thalkirchen - Obersendling - Forstenried - Fürstenried - Solln"
    '''
    p, y, names = p_y_n
    all_names = names.split(' - ')

    return [(p,y,n) for n in all_names]


def main():
    '''parse the csv file into multiple files based on the year and
    filter unnecessary data
    '''

    with open('wahlbeteiligung.csv', 'r') as infile:
        csvreader = csv.reader(infile)

        percentage_ix = 3 # 5
        year_ix = 14
        name_ix = 17

        voter_turnout = []

        for row in csvreader:
            percentage = row[percentage_ix]
            year       = row[year_ix]
            name       = row[name_ix]
            
            voter_turnout.append((percentage, year, name))

    # drop first 
    voter_turnout = voter_turnout[1:]
    print('Before filtering: ', len(voter_turnout))


    # filter valid names
    filtered_voter_turnout = list(filter(lambda p_y_n: valid_name(p_y_n[2]), voter_turnout))
    print('After filtering: ', len(filtered_voter_turnout))

    # map to more readable names
    mapped_voter_turnout = list(map(prepare_name, filtered_voter_turnout))

    # transform the multiple districts to a single district per line
    transformed_voter_turnout = []
    for row in mapped_voter_turnout:
        single_district_votes = transform_voter_turnout(row)
        for sdv in single_district_votes:
            transformed_voter_turnout.append(sdv)

    print('After transforming: ', len(transformed_voter_turnout))

    dict = {}
    dict['2002'] = {}
    dict['2003'] = {}
    dict['2004'] = {}
    dict['2005'] = {}
    dict['2008'] = {}
    dict['2009'] = {}

    for (p, y, n) in transformed_voter_turnout:
        dict[y][n] = float(p.replace(',','.'))

    # with open('wahlbeteiligung_cleaned_count.json', 'w') as f:
    with open('wahlbeteiligung_cleaned.json', 'w') as f:
        json.dump(dict, f)

if __name__ == '__main__':
    main()

