import csv 
import json
from itertools import dropwhile 

def filter_interesting_ages(p_d_y_n):
    '''composed filter function for mean_ages dataset
    '''
    return valid_year(p_d_y_n) and is_gesamt(p_d_y_n) and valid_name(p_d_y_n)

def valid_name(p_d_y_n):
    '''we don't need the global statistics or the first line
    '''
    name = p_d_y_n[3]
    return 'Stadt München' not in name 

def valid_year(p_d_y_n):
    '''we are only interested in the following years: 2002,2003,2005,2008,2009
    because we only have data for the voter turnout
    '''
    year = p_d_y_n[2]
    return year == '2002' or year == '2003' or year == '2005' or year == '2008' or year == '2009'

def is_gesamt(p_d_y_n):
    '''we only want full datasets, not only foreigners or germans
    '''
    data_name = p_d_y_n[1]
    return 'gesamt' in data_name

def prepare_name(p_d_y_n):
    '''we don't need the numbers in the front
    e.g "13 Bogenhausen"
    '''
    p, d, y, name = p_d_y_n
    cut_name = dropwhile(lambda c: c.isdigit(), name)
    # print (name, '|' , ''.join(list(cut_name)[1:]))

    return p,y, ''.join(list(cut_name)[1:])

def transform_district_names(p_y_n):
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

    with open('altersdurchschnitt.csv', 'r') as infile:
        csvreader = csv.reader(infile)

        percentage_ix = 3
        dataset_name_ix = 9
        year_ix = 14
        name_ix = 17

        mean_age = []

        for row in csvreader:
            percentage   = row[percentage_ix]
            dataset_name = row[dataset_name_ix]
            year         = row[year_ix]
            name         = row[name_ix]

            # print('{}, {}, {}, {}'.format(percentage, dataset_name, year, name))
            mean_age.append((percentage, dataset_name, year, name))

    # drop first 
    mean_age = mean_age[1:]
    print('Before filtering: ', len(mean_age))

    # filter valid names
    filtered_mean_age = list(filter(lambda p_d_y_n: filter_interesting_ages(p_d_y_n), mean_age))

    print('After filtering: ', len(filtered_mean_age))

    # map to more readable names and drop the data-name
    mapped_mean_age = list(map(prepare_name, filtered_mean_age))

    # transform the multiple districts to a single district per line
    transformed_mean_age = []
    for row in mapped_mean_age:
        single_district_votes = transform_district_names(row)
        for sdv in single_district_votes:
            transformed_mean_age.append(sdv)

    print('After transforming: ', len(transformed_mean_age))

    # for r in transformed_mean_age:
    #     print(r)

    dict = {}
    dict['2002'] = {}
    dict['2003'] = {}
    dict['2005'] = {}
    dict['2008'] = {}
    dict['2009'] = {}

    for (p, y, n) in transformed_mean_age:
        dict[y][n] = float(p.replace(',','.'))

    with open('altersdurchschnitt_cleaned.json', 'w') as f:
        json.dump(dict, f)

if __name__ == '__main__':
    main()

