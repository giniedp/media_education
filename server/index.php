<?php
	require_once('inc.global.php');

  $debug = $_GET['debug'] == 'true';
  if(!$debug) {
    header('Cache-Control: no-cache, must-revalidate');
    header('Content-type: application/json');
    header('Access-Control-Allow-Origin: *');
  }

  $apicall = $_GET['func']?$_GET['func']:$_POST['func'];
  switch ($apicall) {
    case 'getid':
      $ident = trim($_GET['ident']?$_GET['ident']:$_POST['ident']);
      Log::debug('ident is: '.$ident);
      if($ident) {
        $ids = Id::getIdsForIdents(array($ident));
        //check if we have some id
        if($ids && count($ids) == 1) {
          echo json_encode($ids[0]->getHash());
          break;
        }
        Log::debug('did not find id for ident: '.$ident.' trying to get a new one');
        
        //we need a new id for some user specified ident(fb?)
        $id = Id::getNewId($ident);
        if($id) {
          echo json_encode($id->getHash());
          break;
        }
        Log::debug('did not manage to get id for ident: '.$ident.' trying to get a new one without ident');
      }
      
      //we need some id for some guest user
      $id = Id::getNewId();
      if($id) {
        echo json_encode($id->getHash());
        break;
      }
      break;

    case 'dictionary':
      $sim = trim($_GET['term']?$_GET['term']:$_POST['term']);
      if (strlen($sim) > 2) {
        $vocs = Array();
        foreach (Vocabulary::getSimilarVocabularies($sim) as $voc) {
          $x = $voc->getData();
          $x['label'] = $x['origin']." (".$x['language'].")";
          $vocs[] = $x;
        }

        echo json_encode($vocs);
      }
      break;
    
    case 'practice':
      $vocs = Array();
      $vocs['vocabulary'] = Array();
      $from = $_GET['from']?$_GET['from']:'de';
      $to = $_GET['to']?$_GET['to']:'en';
      $ordered = $_GET['ordered'] == '1' || $_GET['ordered'] == 1;
      $realvocs = Vocabulary::getVocabularies($from, $to, !$ordered);
      if ($realvocs) {
        foreach ($realvocs as $voc) {
          $vocs['vocabulary'][] = $voc->getData();
        }
      }

      echo json_encode($vocs);
      break;
    
    default:
      print_r($_GET);
      break;
  
  }
  
  if ($debug)
    print_r(Log::getInstance()->getdebugMsg());
?>
