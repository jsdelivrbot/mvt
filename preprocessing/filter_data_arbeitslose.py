import csv 
import json
from itertools import dropwhile 

def filter_interesting(u_y_n):
    '''composed filter function for mean_ages dataset
    '''
    return valid_year(u_y_n) and valid_name(u_y_n)

def valid_name(u_y_n):
    '''we don't need the global statistics or the first line
    '''
    name = u_y_n[2]
    return 'Stadt München' not in name 

def valid_year(u_y_n):
    '''we are only interested in the following years: 2002,2003,2005,2008,2009
    because we only have data for the voter turnout
    '''
    year = u_y_n[1]
    return year == '2002' or year == '2003' or year == '2005' or year == '2008' or year == '2009'

# def is_gesamt(p_d_y_n):
#     '''we only want full datasets, not only foreigners or germans
#     '''
#     data_name = p_d_y_n[1]
#     return 'gesamt' in data_name

def prepare_name(u_y_n):
    '''we don't need the numbers in the front
    e.g "13 Bogenhausen"
    '''
    u, y, name = u_y_n
    cut_name = dropwhile(lambda c: c.isdigit(), name)
    # print (name, '|' , ''.join(list(cut_name)[1:]))

    return u,y, ''.join(list(cut_name)[1:])

def transform_district_names(u_y_n):
    '''Some rows have data for multiple districts, we want a single row per district
    e.g "Thalkirchen - Obersendling - Forstenried - Fürstenried - Solln"
    '''
    u, y, names = u_y_n
    all_names = names.split(' - ')

    return [(u,y,n) for n in all_names]

def print_list(l):
    '''shortcut for debug purposes
    '''
    for e in l:
        print(e)

def main():
    '''parse the csv file into multiple files based on the year and
    filter unnecessary data
    '''

    with open('arbeitslose.csv', 'r') as infile:
        csvreader = csv.reader(infile)

        unemployment_ix = 5
        year_ix = 14
        name_ix = 17

        unemployment = []

        for row in csvreader:
            unemployed   = row[unemployment_ix]
            year         = row[year_ix]
            name         = row[name_ix]

            # print('{}, {}, {}'.format(unemployed, year, name))
            unemployment.append((unemployed, year, name))

    # drop first 
    unemployment = unemployment[1:]
    print('Before filtering: ', len(unemployment))

    # filter valid names
    filtered_unemployment = list(filter(lambda u_y_n: filter_interesting(u_y_n), unemployment))

    print('After filtering: ', len(filtered_unemployment))

    # map to more readable names and drop the data-name
    mapped_unemployment = list(map(prepare_name, filtered_unemployment))

    # transform the multiple districts to a single district per line
    transformed_unemployment = []
    for row in mapped_unemployment:
        single_district_votes = transform_district_names(row)
        for sdv in single_district_votes:
            transformed_unemployment.append(sdv)

    print('After transforming: ', len(transformed_unemployment))


    calculated_unemployment = []

    with open('wahlbeteiligung_cleaned_count.json', 'r') as f:
        voter_turnout = json.load(f)

        for (unemployment_count, year, name) in transformed_unemployment:
            if (name in voter_turnout[year]):
                people_count = voter_turnout[year][name]
                unemployment_count = round(float(unemployment_count.replace(',', '.')))
                unemployment_rate = unemployment_count / float(people_count)
                print (unemployment_rate)
                calculated_unemployment.append((unemployment_rate, year, name))
            # else:
                # print ('Didn\'t find {} in {}: {}'.format(name, year, unemployment_count))

    dict = {}
    dict['2002'] = {}
    dict['2003'] = {}
    dict['2005'] = {}
    dict['2008'] = {}
    dict['2009'] = {}

    for (p, y, n) in calculated_unemployment:
        dict[y][n] = p #float(p.replace(',','.'))

    with open('arbeitslose_cleaned.json', 'w') as f:
        json.dump(dict, f)

if __name__ == '__main__':
    main()

